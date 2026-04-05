import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

/**
 * GET /api/auth/session - получить текущую сессию пользователя
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: session.userId,
          email: session.email,
          role: session.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { user: null },
      { status: 200 }
    );
  }
}
