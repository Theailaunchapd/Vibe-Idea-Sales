import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { User } from '../../db/schema';

// Environment variables with defaults
const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT token generation
export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  type: 'access' | 'refresh';
}

export function generateAccessToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    type: 'access'
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function generateRefreshToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Token expiration helpers
export function getAccessTokenExpiration(): Date {
  const expiresIn = JWT_EXPIRES_IN;
  const ms = parseTokenExpiration(expiresIn);
  return new Date(Date.now() + ms);
}

export function getRefreshTokenExpiration(): Date {
  const expiresIn = REFRESH_TOKEN_EXPIRES_IN;
  const ms = parseTokenExpiration(expiresIn);
  return new Date(Date.now() + ms);
}

function parseTokenExpiration(expiration: string): number {
  const unit = expiration.slice(-1);
  const value = parseInt(expiration.slice(0, -1));

  const units: { [key: string]: number } = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return value * (units[unit] || units.d);
}

// Random token generation for password reset and email verification
export function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

// Password reset token expiration (1 hour)
export function getPasswordResetExpiration(): Date {
  return new Date(Date.now() + 60 * 60 * 1000);
}

// Email verification token expiration (24 hours)
export function getEmailVerificationExpiration(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Extract user data for client responses (remove sensitive fields)
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  skoolId: string | null;
  profilePicture: string | null;
  emailVerified: boolean;
  role: string | null;
  focus: string[] | null;
  services: string[] | null;
  topics: string[] | null;
  avatarInitial: string | null;
  createdAt: Date;
  lastLogin: Date | null;
}

export function sanitizeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    skoolId: user.skoolId,
    profilePicture: user.profilePicture,
    emailVerified: user.emailVerified,
    role: user.role,
    focus: user.focus,
    services: user.services,
    topics: user.topics,
    avatarInitial: user.avatarInitial,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };
}
