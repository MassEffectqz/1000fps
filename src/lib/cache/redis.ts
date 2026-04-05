/**
 * Redis клиент для кэширования
 * Используется для кэширования запросов к БД и внешних API
 *
 * Установка: npm install ioredis
 * Docker: docker run -d -p 6379:6379 redis:alpine
 *
 * TODO: Установить ioredis и раскомментировать код
 */

// TODO: Установить ioredis и раскомментировать код
// import type { Redis } from 'ioredis';

// const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// let redis: Redis | null = null;

// ... (закомментировано до установки ioredis)

export function getRedis(): null {
  return null;
}

export async function cacheGet<T>(_key: string): Promise<T | null> {
  return null;
}

export async function cacheSet(
  _key: string,
  _value: unknown,
  _ttlSeconds: number = 3600
): Promise<boolean> {
  return false;
}

export async function cacheDel(_key: string): Promise<boolean> {
  return false;
}

export async function cacheDelPattern(_pattern: string): Promise<boolean> {
  return false;
}

export async function cacheGetOrSet<T>(
  _key: string,
  fn: () => Promise<T>,
  _ttlSeconds: number = 3600
): Promise<T> {
  return fn();
}

export async function cacheIncr(_key: string): Promise<number> {
  return 0;
}

export async function checkRedisHealth(): Promise<boolean> {
  return false;
}

export async function closeRedis(): Promise<void> {
  // nothing
}
