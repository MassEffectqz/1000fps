// ============================================
// Type Guards для Admin Panel
// ============================================

interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

/**
 * Проверка структуры ответа API
 */
export function isApiResponse<T>(data: unknown): data is ApiResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data
  );
}

/**
 * Проверка на объект с id
 */
export function hasId(data: unknown): data is { id: number | string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('id' in data)
  );
}

/**
 * Проверка на объект с name
 */
export function hasName(data: unknown): data is { name: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('name' in data) &&
    typeof (data as { name: unknown }).name === 'string'
  );
}

/**
 * Проверка на массив объектов
 */
export function isArray<T>(data: unknown, predicate: (item: unknown) => item is T): data is T[] {
  return Array.isArray(data) && data.every(predicate);
}
