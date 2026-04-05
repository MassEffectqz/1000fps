'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends Omit<ImageProps, 'loading'> {
  placeholderBlur?: boolean;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Ленивая загрузка изображений с Intersection Observer
 * Автоматически загружает изображение когда оно появляется в области видимости
 */
export function LazyImage({
  src,
  alt,
  placeholderBlur = true,
  threshold = 0.1,
  rootMargin = '200px',
  className,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{ backgroundColor: placeholderBlur ? '#1a1a1a' : 'transparent' }}
    >
      {/* Placeholder */}
      {!isLoaded && placeholderBlur && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray2 via-gray1 to-gray2" />
      )}

      {/* Image */}
      {isInView && (
        <Image
          {...props}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  );
}

/**
 * Ленивая загрузка для фоновых изображений
 */
export function LazyBackground({
  src,
  alt,
  className,
  children,
}: {
  src: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{
        backgroundImage: isInView ? `url(${src})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#1a1a1a',
        transition: 'background-image 0.3s ease',
      }}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray2 via-gray1 to-gray2" />
      )}

      {/* Content */}
      {children}

      {/* Hidden image for loading detection */}
      {isInView && (
        <img
          src={src}
          alt={alt || ''}
          className="hidden"
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
}
