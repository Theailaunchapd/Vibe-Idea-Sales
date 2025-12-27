// Authentication service for frontend API calls
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  createdAt: string;
  lastLogin: string | null;
}

export interface AuthResponse {
  message: string;
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
  requiresVerification?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  role?: string;
  focus?: string[];
  services?: string[];
  topics?: string[];
}

export interface SessionInfo {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

// Token storage
export const TokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  setAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },

  setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  },

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  hasValidToken(): boolean {
    return !!this.getAccessToken();
  }
};

// Add authorization header to requests
function getAuthHeaders(): HeadersInit {
  const token = TokenStorage.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

// Signup
export async function signup(data: SignupData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }

  const result = await response.json();

  // Store tokens
  TokenStorage.setAccessToken(result.accessToken);
  TokenStorage.setRefreshToken(result.refreshToken);

  return result;
}

// Login
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const result = await response.json();

  // Store tokens
  TokenStorage.setAccessToken(result.accessToken);
  TokenStorage.setRefreshToken(result.refreshToken);

  return result;
}

// Logout
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    TokenStorage.clearTokens();
  }
}

// Get current user
export async function getCurrentUser(): Promise<SafeUser> {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to get current user');
  }

  const result = await response.json();
  return result.user;
}

// Refresh access token
export async function refreshAccessToken(): Promise<string> {
  const refreshToken = TokenStorage.getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    TokenStorage.clearTokens();
    throw new Error('Token refresh failed');
  }

  const result = await response.json();
  TokenStorage.setAccessToken(result.accessToken);

  return result.accessToken;
}

// Verify email
export async function verifyEmail(token: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Email verification failed');
  }
}

// Resend verification email
export async function resendVerificationEmail(): Promise<void> {
  const response = await fetch(`${API_BASE}/api/auth/resend-verification`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to resend verification email');
  }
}

// Forgot password
export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  if (!response.ok) {
    throw new Error('Failed to send password reset email');
  }
}

// Reset password
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Password reset failed');
  }
}

// Get active sessions
export async function getSessions(): Promise<SessionInfo[]> {
  const response = await fetch(`${API_BASE}/api/auth/sessions`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to get sessions');
  }

  const result = await response.json();
  return result.sessions;
}

// Revoke session
export async function revokeSession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/auth/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to revoke session');
  }
}

// Auto-refresh token before expiration
let refreshTimeout: NodeJS.Timeout | null = null;

export function setupTokenRefresh(): void {
  // Clear existing timeout
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }

  // Refresh token 5 minutes before expiration (7 days - 5 minutes)
  const refreshInterval = (7 * 24 * 60 - 5) * 60 * 1000;

  refreshTimeout = setTimeout(async () => {
    try {
      await refreshAccessToken();
      setupTokenRefresh(); // Setup next refresh
    } catch (error) {
      console.error('Auto token refresh failed:', error);
      TokenStorage.clearTokens();
      window.location.href = '/login';
    }
  }, refreshInterval);
}

export function clearTokenRefresh(): void {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }
}
