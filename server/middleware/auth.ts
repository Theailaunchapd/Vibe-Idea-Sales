import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/auth';
import { db } from '../../db';
import { sessions, users } from '../../db/schema';
import { eq, and, gt } from 'drizzle-orm';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      userId?: string;
      session?: {
        id: string;
        token: string;
      };
    }
  }
}

// Middleware to authenticate requests using JWT
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header or cookie
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : req.cookies?.access_token;

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload || payload.type !== 'access') {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Check if session exists and is valid
    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.token, token),
          eq(sessions.userId, payload.userId),
          gt(sessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!session) {
      res.status(401).json({ error: 'Session expired or invalid' });
      return;
    }

    // Update last activity
    await db
      .update(sessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(sessions.id, session.id));

    // Attach user info to request
    req.user = payload;
    req.userId = payload.userId;
    req.session = {
      id: session.id,
      token: session.token
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Middleware to check if user's email is verified
export async function requireEmailVerification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Authentication required' });
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

    if (!user.emailVerified) {
      res.status(403).json({
        error: 'Email verification required',
        message: 'Please verify your email address to access this resource'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Email verification check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Optional authentication - attaches user if token is valid but doesn't require it
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : req.cookies?.access_token;

    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.type === 'access') {
        const [session] = await db
          .select()
          .from(sessions)
          .where(
            and(
              eq(sessions.token, token),
              eq(sessions.userId, payload.userId),
              gt(sessions.expiresAt, new Date())
            )
          )
          .limit(1);

        if (session) {
          req.user = payload;
          req.userId = payload.userId;
          req.session = {
            id: session.id,
            token: session.token
          };
        }
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors
    next();
  }
}
