/**
 * In-memory кэш с LRU eviction
 * Для кэширования часто используемых данных в памяти процесса
 */

interface CacheEntry<T> {
  value: T;
  expires: number;
  lastAccessed: number;
}

interface CacheOptions {
  maxItems?: number;
  defaultTTL?: number; // в секундах
}

class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxItems: number;
  private defaultTTL: number;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.maxItems = options.maxItems || 1000;
    this.defaultTTL = options.defaultTTL || 300; // 5 минут по умолчанию
  }

  /**
   * Получить значение из кэша
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Проверяем срок действия
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    // Обновляем время последнего доступа
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  /**
   * Сохранить значение в кэш
   */
  set(key: string, value: T, ttlSeconds?: number): void {
    // Если кэш полон, удаляем наименее используемые элементы
    if (this.cache.size >= this.maxItems) {
      this.evictLRU();
    }

    const ttl = (ttlSeconds ?? this.defaultTTL) * 1000;
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl,
      lastAccessed: Date.now(),
    });
  }

  /**
   * Удалить значение из кэша
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Очистить весь кэш
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Получить размер кэша
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Очистить просроченные записи
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * LRU Eviction - удалить наименее используемый элемент
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Получить статистику кэша
   */
  getStats(): {
    size: number;
    maxItems: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxItems: this.maxItems,
      hitRate: 0, // Можно добавить счетчики hit/miss
    };
  }
}

// Глобальные экземпляры кэша для разных типов данных
const productCache = new LRUCache<unknown>({ maxItems: 500, defaultTTL: 600 }); // 10 минут
const categoryCache = new LRUCache<unknown>({ maxItems: 100, defaultTTL: 1800 }); // 30 минут
const userCache = new LRUCache<unknown>({ maxItems: 1000, defaultTTL: 300 }); // 5 минут
const configCache = new LRUCache<unknown>({ maxItems: 50, defaultTTL: 3600 }); // 1 час

/**
 * Получить кэш для товаров
 */
export function getProductCache(): LRUCache<unknown> {
  return productCache;
}

/**
 * Получить кэш для категорий
 */
export function getCategoryCache(): LRUCache<unknown> {
  return categoryCache;
}

/**
 * Получить кэш для пользователей
 */
export function getUserCache(): LRUCache<unknown> {
  return userCache;
}

/**
 * Получить кэш для конфигурации
 */
export function getConfigCache(): LRUCache<unknown> {
  return configCache;
}

/**
 * Очистить все кэши (при деплое или изменении данных)
 */
export function clearAllCaches(): void {
  productCache.clear();
  categoryCache.clear();
  userCache.clear();
  configCache.clear();
}

/**
 * Периодическая очистка просроченных записей
 */
setInterval(() => {
  productCache.cleanup();
  categoryCache.cleanup();
  userCache.cleanup();
  configCache.cleanup();
}, 60000); // Каждую минуту

export { LRUCache };
