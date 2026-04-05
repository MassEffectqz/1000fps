'use client';

import { useCallback, useRef, useEffect, useState } from 'react';

/**
 * Debounce хук для оптимизации частых вызовов
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number = 300
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay]
  );
}

/**
 * Throttle хук для ограничения частоты вызовов
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number = 100
) {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCallRef.current >= limit) {
        lastCallRef.current = now;
        fn(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          fn(...args);
        }, limit - (now - lastCallRef.current));
      }
    },
    [fn, limit]
  );
}

/**
 * Хук для отслеживания видимости элемента
 */
export function useOnScreen(ref: React.RefObject<HTMLElement>, threshold = 0.1) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold]);

  return isIntersecting;
}

/**
 * Хук для виртуализации списков
 * Рендерит только видимые элементы
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 10;
  const endIndex = Math.min(items.length, startIndex + visibleCount);

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
  };
}
