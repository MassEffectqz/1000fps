import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Выход пользователя (очистка сессии)
 *
 * Returns: { success: true }
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Вы успешно вышли из системы',
  });

  // Удаляем cookie сессии
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}

/**
 * GET /api/auth/logout
 * Также поддерживается GET для удобства
 */
export async function GET() {
  return POST();
}
