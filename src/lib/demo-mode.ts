/**
 * Демо-режим адаптер
 * Когда NEXT_PUBLIC_DEMO_MODE=true, использует моковые данные вместо Prisma
 */

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function isDemoMode(): boolean {
  return DEMO_MODE;
}

/**
 * Обертка для Server Actions, которая возвращает моковые данные в демо-режиме
 */
export async function withDemoMode<T>(
  demoFn: () => Promise<T>,
  prodFn: () => Promise<T>
): Promise<T> {
  if (DEMO_MODE) {
    return demoFn();
  }
  return prodFn();
}
