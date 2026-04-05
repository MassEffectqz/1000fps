import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

// Секретный ключ для JWT (должен быть в .env.local)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
);

// Типы для сессии
export interface SessionPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CUSTOMER';
  iat?: number;
  exp?: number;
}

// Роли с доступом к админке
const ADMIN_ROLES = ['ADMIN', 'MANAGER'] as const;

/**
 * Создать JWT сессию для пользователя
 */
export async function createSession(payload: Omit<SessionPayload, 'iat' | 'exp'>) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Проверить и декодировать JWT сессию
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Middleware для защиты админ-панели и пользовательских роутов
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверяем, что это админский путь или API
  const isAdminPath = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');
  const isProfilePath = pathname.startsWith('/profile');
  const isProfileApi = pathname.startsWith('/api/profile');

  // CORS заголовки для всех API ответов
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Заголовки для предотвращения кэширования API ответов
  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  // Обработка CORS preflight запросов
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Получаем токен из cookies
  const token = request.cookies.get('session')?.value;

  // Обработка защищенных профилей
  if (isProfilePath || isProfileApi) {
    // Если токена нет, редиректим на login или возвращаем 401 для API
    if (!token) {
      if (isProfileApi) {
        const headers = { ...corsHeaders, ...noCacheHeaders };
        const response = NextResponse.json(
          { error: 'Требуется аутентификация' },
          { status: 401, headers }
        );
        return response;
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Проверяем валидность токена
    const session = await verifySession(token);

    if (!session) {
      // Токен невалиден, удаляем cookie
      const response = NextResponse.next();
      response.cookies.delete('session');

      if (isProfileApi) {
        const apiResponse = NextResponse.json(
          { error: 'Невалидная сессия' },
          { status: 401, headers: corsHeaders }
        );
        return apiResponse;
      }

      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Продлеваем сессию если осталось меньше 2 часов до истечения
    if (session.exp && session.exp < Date.now() / 1000 + 7200) {
      const newToken = await createSession({
        userId: session.userId,
        email: session.email,
        role: session.role,
      });
      const response = NextResponse.next();
      response.cookies.set('session', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400, // 24 часа
        path: '/',
      });
      response.headers.set('X-User-Id', session.userId);
      response.headers.set('X-User-Email', session.email);
      response.headers.set('X-User-Role', session.role);
      return response;
    }

    // Добавляем информацию о сессии в заголовки для использования в API/pages
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

  // Если это не админский путь и не профиль, пропускаем сразу
  if (!isAdminPath && !isAdminApi) {
    return NextResponse.next();
  }

  // Если токена нет, редиректим на login или возвращаем 401 для API
  if (!token) {
    if (isAdminApi) {
      const response = NextResponse.json(
        { error: 'Требуется аутентификация' },
        { status: 401, headers: corsHeaders }
      );
      return response;
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Проверяем валидность токена
  const session = await verifySession(token);

  if (!session) {
    // Токен невалиден, удаляем cookie
    const response = NextResponse.next();
    response.cookies.delete('session');

    if (isAdminApi) {
      const apiResponse = NextResponse.json(
        { error: 'Невалидная сессия' },
        { status: 401, headers: corsHeaders }
      );
      return apiResponse;
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Проверяем роль пользователя для админки
  if (isAdminPath || isAdminApi) {
    if (!ADMIN_ROLES.includes(session.role as typeof ADMIN_ROLES[number])) {
      if (isAdminApi) {
        const response = NextResponse.json(
          { error: 'Недостаточно прав' },
          { status: 403, headers: corsHeaders }
        );
        return response;
      }

      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Добавляем информацию о сессии в заголовки для использования в API/pages
  const response = NextResponse.next();
  response.headers.set('X-User-Id', session.userId);
  response.headers.set('X-User-Email', session.email);
  response.headers.set('X-User-Role', session.role);

  // CORS заголовки для API
  if (isAdminApi) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  // Продлеваем сессию если осталось меньше 2 часов до истечения
  if (session.exp && session.exp < Date.now() / 1000 + 7200) {
    const newToken = await createSession({
      userId: session.userId,
      email: session.email,
      role: session.role,
    });
    response.cookies.set('session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 часа
      path: '/',
    });
  }

  return response;
}

/**
 * Конфигурация matcher для middleware
 */
export const config = {
  matcher: [
    // Применяем middleware к админке, admin API и профилям
    '/admin/:path*',
    '/admin',
    '/api/admin/:path*',
    '/profile/:path*',
    '/profile',
    '/api/profile/:path*',
    '/api/profile',
  ],
};
