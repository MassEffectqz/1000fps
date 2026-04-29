import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
);

export interface SessionPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CUSTOMER';
  iat?: number;
  exp?: number;
}

const ADMIN_ROLES = ['ADMIN', 'MANAGER'] as const;

const isSecure = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https') ?? false;

export async function createSession(payload: Omit<SessionPayload, 'iat' | 'exp'>) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPath = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');
  const isProfilePath = pathname.startsWith('/profile');
  const isProfileApi = pathname.startsWith('/api/profile');

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  const token = request.cookies.get('session')?.value;

  if (isProfilePath || isProfileApi) {
    if (!token) {
      if (isProfileApi) {
        const headers = { ...corsHeaders, ...noCacheHeaders };
        return NextResponse.json(
          { error: 'Требуется аутентификация' },
          { status: 401, headers }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifySession(token);

    if (!session) {
      const response = NextResponse.next();
      response.cookies.delete('session');

      if (isProfileApi) {
        return NextResponse.json(
          { error: 'Невалидная сессия' },
          { status: 401, headers: corsHeaders }
        );
      }

      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.exp && session.exp < Date.now() / 1000 + 7200) {
      const newToken = await createSession({
        userId: session.userId,
        email: session.email,
        role: session.role,
      });
      const response = NextResponse.next();
      response.cookies.set('session', newToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 86400,
        path: '/',
      });
      response.headers.set('X-User-Id', session.userId);
      response.headers.set('X-User-Email', session.email);
      response.headers.set('X-User-Role', session.role);
      return response;
    }

    const response = NextResponse.next();
    response.headers.set('X-User-Id', session.userId);
    response.headers.set('X-User-Email', session.email);
    response.headers.set('X-User-Role', session.role);

    if (isProfileApi) {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  }

  if (!isAdminPath && !isAdminApi) {
    return NextResponse.next();
  }

  if (!token) {
    if (isAdminApi) {
      return NextResponse.json(
        { error: 'Требуется аутентификация' },
        { status: 401, headers: corsHeaders }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySession(token);

  if (!session) {
    const response = NextResponse.next();
    response.cookies.delete('session');

    if (isAdminApi) {
      return NextResponse.json(
        { error: 'Невалидная сессия' },
        { status: 401, headers: corsHeaders }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPath || isAdminApi) {
    if (!ADMIN_ROLES.includes(session.role as typeof ADMIN_ROLES[number])) {
      if (isAdminApi) {
        return NextResponse.json(
          { error: 'Недостаточно прав' },
          { status: 403, headers: corsHeaders }
        );
      }

      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-User-Id', session.userId);
  response.headers.set('X-User-Email', session.email);
  response.headers.set('X-User-Role', session.role);

  if (isAdminApi) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  if (session.exp && session.exp < Date.now() / 1000 + 7200) {
    const newToken = await createSession({
      userId: session.userId,
      email: session.email,
      role: session.role,
    });
    response.cookies.set('session', newToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin',
    '/api/admin/:path*',
    '/profile/:path*',
    '/profile',
    '/api/profile/:path*',
    '/api/profile',
  ],
};