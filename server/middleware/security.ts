import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

// CSRF Protection Middleware
const csrfTokens = new Map<string, { token: string; createdAt: number }>();

// Clean up expired CSRF tokens every hour
setInterval(() => {
  const now = Date.now();
  const expirationTime = 24 * 60 * 60 * 1000; // 24 hours

  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now - data.createdAt > expirationTime) {
      csrfTokens.delete(sessionId);
    }
  }
}, 60 * 60 * 1000);

// Generate CSRF token for session
export function generateCsrfToken(sessionId: string): string {
  const token = randomBytes(32).toString('hex');
  csrfTokens.set(sessionId, {
    token,
    createdAt: Date.now()
  });
  return token;
}

// Verify CSRF token
export function verifyCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  if (!stored) return false;

  const now = Date.now();
  const expirationTime = 24 * 60 * 60 * 1000; // 24 hours

  // Check if token is expired
  if (now - stored.createdAt > expirationTime) {
    csrfTokens.delete(sessionId);
    return false;
  }

  return stored.token === token;
}

// CSRF middleware for state-changing operations
export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  // Get CSRF token from header or body
  const token = req.headers['x-csrf-token'] as string || req.body._csrf;
  const sessionId = req.session?.id || req.cookies?.session_id;

  if (!sessionId) {
    res.status(403).json({ error: 'Session required' });
    return;
  }

  if (!token || !verifyCsrfToken(sessionId, token)) {
    res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'CSRF token validation failed'
    });
    return;
  }

  next();
}

// Security headers middleware
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.openai.com;"
  );

  // HTTPS redirect in production
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
    return;
  }

  next();
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
}

// Validate and sanitize request body
export function sanitizeBody(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }
  next();
}
