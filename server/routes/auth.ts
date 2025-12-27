import express, { Request, Response, Router } from 'express';
import { db } from '../../db';
import { users, sessions, passwordResetTokens, emailVerificationTokens } from '../../db/schema';
import { eq, and, gt } from 'drizzle-orm';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  getAccessTokenExpiration,
  getRefreshTokenExpiration,
  generateSecureToken,
  getPasswordResetExpiration,
  getEmailVerificationExpiration,
  isValidEmail,
  validatePassword,
  sanitizeUser
} from '../utils/auth';
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail
} from '../utils/email';
import { loginRateLimiter, recordLoginAttempt } from '../middleware/rateLimiter';
import { authenticateToken } from '../middleware/auth';

const router: Router = express.Router();

// POST /api/auth/signup - Register new user
router.post('/signup', loginRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, focus, services, topics } = req.body;

    // Validation
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
      return;
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate avatar initial
    const avatarInitial = name.charAt(0).toUpperCase();

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: role || null,
        focus: focus || null,
        services: services || null,
        topics: topics || null,
        avatarInitial,
        emailVerified: false
      })
      .returning();

    // Generate verification token
    const verificationToken = generateSecureToken();
    await db.insert(emailVerificationTokens).values({
      userId: newUser.id,
      token: verificationToken,
      expiresAt: getEmailVerificationExpiration(),
      used: false
    });

    // Send verification email
    try {
      await sendVerificationEmail(newUser.email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue even if email fails
    }

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Create session
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    await db.insert(sessions).values({
      userId: newUser.id,
      token: accessToken,
      refreshToken,
      expiresAt: getAccessTokenExpiration(),
      refreshExpiresAt: getRefreshTokenExpiration(),
      userAgent,
      ipAddress
    });

    res.status(201).json({
      message: 'Account created successfully. Please verify your email.',
      user: sanitizeUser(newUser),
      accessToken,
      refreshToken,
      requiresVerification: true
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login - Login with email/password
router.post('/login', loginRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user || !user.passwordHash) {
      await recordLoginAttempt(email, ipAddress, false);
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      await recordLoginAttempt(email, ipAddress, false);
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Record successful login
    await recordLoginAttempt(email, ipAddress, true);

    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Create session
    await db.insert(sessions).values({
      userId: user.id,
      token: accessToken,
      refreshToken,
      expiresAt: getAccessTokenExpiration(),
      refreshExpiresAt: getRefreshTokenExpiration(),
      userAgent,
      ipAddress
    });

    res.json({
      message: 'Login successful',
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
      requiresVerification: !user.emailVerified
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout - Logout and invalidate session
router.post('/logout', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.session?.id) {
      res.status(400).json({ error: 'No active session' });
      return;
    }

    // Delete session
    await db
      .delete(sessions)
      .where(eq(sessions.id, req.session.id));

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Find session
    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.refreshToken, refreshToken),
          eq(sessions.userId, payload.userId),
          gt(sessions.refreshExpiresAt, new Date())
        )
      )
      .limit(1);

    if (!session) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    // Update session
    await db
      .update(sessions)
      .set({
        token: newAccessToken,
        expiresAt: getAccessTokenExpiration(),
        lastActivityAt: new Date()
      })
      .where(eq(sessions.id, session.id));

    res.json({
      accessToken: newAccessToken,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/verify-email - Verify email address
router.post('/verify-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Verification token required' });
      return;
    }

    // Find verification token
    const [verificationToken] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, token),
          eq(emailVerificationTokens.used, false),
          gt(emailVerificationTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!verificationToken) {
      res.status(400).json({ error: 'Invalid or expired verification token' });
      return;
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, verificationToken.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update user as verified
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, user.id));

    // Mark token as used
    await db
      .update(emailVerificationTokens)
      .set({ used: true })
      .where(eq(emailVerificationTokens.id, verificationToken.id));

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ error: 'Email already verified' });
      return;
    }

    // Generate new verification token
    const verificationToken = generateSecureToken();
    await db.insert(emailVerificationTokens).values({
      userId: user.id,
      token: verificationToken,
      expiresAt: getEmailVerificationExpiration(),
      used: false
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', loginRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Find user (don't reveal if user exists or not)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (user && user.passwordHash) {
      // Generate reset token
      const resetToken = generateSecureToken();
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token: resetToken,
        expiresAt: getPasswordResetExpiration(),
        used: false
      });

      // Send reset email
      try {
        await sendPasswordResetEmail(user.email, resetToken);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
      }
    }

    // Always return success to prevent email enumeration
    res.json({
      message: 'If an account exists with that email, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      res.status(400).json({
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      });
      return;
    }

    // Find reset token
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!resetToken) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, resetToken.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetToken.id));

    // Invalidate all existing sessions for this user
    await db
      .delete(sessions)
      .where(eq(sessions.userId, resetToken.userId));

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/sessions - Get all active sessions
router.get('/sessions', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const activeSessions = await db
      .select({
        id: sessions.id,
        userAgent: sessions.userAgent,
        ipAddress: sessions.ipAddress,
        createdAt: sessions.createdAt,
        lastActivityAt: sessions.lastActivityAt,
        expiresAt: sessions.expiresAt,
        isCurrent: sessions.id
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, req.userId),
          gt(sessions.expiresAt, new Date())
        )
      );

    const sessionsWithCurrent = activeSessions.map((s) => ({
      ...s,
      isCurrent: s.id === req.session?.id
    }));

    res.json({ sessions: sessionsWithCurrent });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/auth/sessions/:sessionId - Revoke a specific session
router.delete('/sessions/:sessionId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Delete session (only if it belongs to the user)
    await db
      .delete(sessions)
      .where(
        and(
          eq(sessions.id, sessionId),
          eq(sessions.userId, req.userId)
        )
      );

    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
