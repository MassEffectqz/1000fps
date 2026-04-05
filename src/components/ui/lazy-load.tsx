'use client';

import { lazy, Suspense, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  minHeight?: number;
}

/**
 * Ленивая загрузка тяжелых компонентов
 * Загружает контент только когда он появляется в области видимости
 */
export function LazyLoad({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '200px',
  className,
  minHeight = 100,
}: LazyLoadProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);

  return (
    <div
      ref={setRef}
      className={cn('relative', className)}
      style={{ minHeight }}
    >
      {shouldRender ? (
        children
      ) : fallback ? (
        fallback
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

/**
 * Обертка для динамического импорта компонентов
 */
export function createLazyComponent<TProps extends Record<string, unknown>>(
  importFn: () => Promise<{ default: React.ComponentType<TProps> }>
) {
  const LazyComponent = lazy(importFn);

  return function LazyWrapper(props: TProps) {
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
