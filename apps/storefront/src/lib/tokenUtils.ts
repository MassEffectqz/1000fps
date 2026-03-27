// ============================================
// Token Management Utilities
// ============================================

import type { User } from '@/types';

// ============================================
// Auth Token (cookies)
// ============================================

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth_token='))
      ?.split('=')[1] || null
  );
}

export function setAuthToken(token: string, expiresIn?: number): void {
  if (typeof window === 'undefined') return;

  const maxAge = expiresIn ? Math.floor(expiresIn / 1000) : 7200; // 2 hours default
  document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Strict';
}

// ============================================
// Refresh Token (localStorage for persistence)
// ============================================

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('refresh_token', token);
}

export function removeRefreshToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('refresh_token');
}

// ============================================
// Auth State
// ============================================

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

export function logout(): void {
  removeAuthToken();
  removeRefreshToken();

  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_user');
  }
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('auth_user');
  return userStr ? JSON.parse(userStr) : null;
}

export function setUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_user', JSON.stringify(user));
}

// ============================================
// Token Refresh Queue
// ============================================

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

export function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

export function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    logout();
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();

  if (data.accessToken) {
    setAuthToken(data.accessToken, data.expiresIn);
  }

  if (data.refreshToken) {
    setRefreshToken(data.refreshToken);
  }

  if (data.user) {
    setUser(data.user);
  }

  onTokenRefreshed(data.accessToken);
  return data.accessToken;
}

export async function handleQueueRefresh(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export function isTokenRefreshing(): boolean {
  return isRefreshing;
}

export function setTokenRefreshing(refreshing: boolean) {
  isRefreshing = refreshing;
}
