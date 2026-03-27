// ============================================
// Token Management Utilities for Admin
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

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

export function logout(): void {
  removeAuthToken();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_user');
  }
}
