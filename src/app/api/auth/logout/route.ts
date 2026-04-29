import { NextResponse } from 'next/server';

const isSecure = (process.env.NEXT_PUBLIC_APP_URL || '').startsWith('https');

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Вы успешно вышли из системы',
  });

  response.cookies.set('session', '', {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}

export async function GET() {
  return POST();
}