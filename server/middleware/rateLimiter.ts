import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { loginAttempts } from '../../db/schema';
import { and, eq, gte } from 'drizzle-orm';

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
const LOGIN_ATTEMPT_WINDOW = parseInt(process.env.LOGIN_ATTEMPT_WINDOW || '900000'); // 15 minutes

// Rate limiter for login attempts
export async function loginRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    if (!email) {
      next();
      return;
    }

    // Get failed login attempts in the last window
    const windowStart = new Date(Date.now() - LOGIN_ATTEMPT_WINDOW);

    const attempts = await db
      .select()
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.email, email.toLowerCase()),
          eq(loginAttempts.successful, false),
          gte(loginAttempts.attemptedAt, windowStart)
        )
      );

    if (attempts.length >= MAX_LOGIN_ATTEMPTS) {
      const oldestAttempt = attempts[0];
      const timeUntilReset = Math.ceil(
        (oldestAttempt.attemptedAt.getTime() + LOGIN_ATTEMPT_WINDOW - Date.now()) / 60000
      );

      res.status(429).json({
        error: 'Too many login attempts',
        message: `Too many failed login attempts. Please try again in ${timeUntilReset} minutes.`,
        retryAfter: timeUntilReset
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // Don't block request on rate limiter errors
    next();
  }
}

// Record login attempt
export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  successful: boolean
): Promise<void> {
  try {
    await db.insert(loginAttempts).values({
      email: email.toLowerCase(),
      ipAddress,
      successful,
      attemptedAt: new Date()
    });
  } catch (error) {
    console.error('Error recording login attempt:', error);
  }
}

// Clean up old login attempts (call this periodically)
export async function cleanupLoginAttempts(): Promise<void> {
  try {
    const cutoffDate = new Date(Date.now() - LOGIN_ATTEMPT_WINDOW);
    await db
      .delete(loginAttempts)
      .where(gte(loginAttempts.attemptedAt, cutoffDate));
  } catch (error) {
    console.error('Error cleaning up login attempts:', error);
  }
}

// General API rate limiter using express-rate-limit
import rateLimit from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for authenticated users with valid sessions
  skip: (req: Request) => {
    return !!req.userId;
  }
});

// Strict rate limiter for sensitive operations (signup, password reset)
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    error: 'Too many requests',
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
