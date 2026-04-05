import { SignJWT, jwtVerify } from 'jose';

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
 * Получить текущую сессию пользователя (для server actions)
 */
export async function getSession(): Promise<SessionPayload | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return null;
  }

  return await verifySession(token);
}

/**
 * Проверить, что пользователь авторизован и имеет роль ADMIN или MANAGER
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session) {
    throw new Error('Требуется аутентификация');
  }

  if (session.role !== 'ADMIN' && session.role !== 'MANAGER') {
    throw new Error('Недостаточно прав для выполнения этого действия');
  }

  return session;
}

/**
 * Проверить, что пользователь авторизован
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session) {
    throw new Error('Требуется аутентификация');
  }

  return session;
}
