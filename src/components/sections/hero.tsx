'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
const slides = [
  {
    idx: 0,
    image: '/images/slider/slider1.png',
    alt: '1000FPS - компьютерная техника и гейминг',
  },
  {
    idx: 1,
    image: '/images/slider/slider2.png',
    alt: '1000FPS - игровые компьютеры',
  },
  {
    idx: 2,
    image: '/images/slider/slider3.png',
    alt: '1000FPS - аксессуары и периферия',
  },
];
export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  // Автопереключение слайдов
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);
  return (
    <section
      className="py-4 sm:py-6 lg:py-8 bg-transparent p-0"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="relative w-full overflow-hidden rounded-[var(--radius)]">
        {/* Slides */}
        {slides.map((slide) => (
          <div
            key={slide.idx}
            className={cn(
              'transition-opacity duration-500',
              activeSlide === slide.idx ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            )}
            data-idx={slide.idx}
          >
            {/* Image */}
            <Image
              src={slide.image}
              alt={slide.alt}
              width={1920}
              height={500}
              className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
              priority={slide.idx === 0}
              sizes="100vw"
            />
          </div>
        ))}
        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-[6px] z-20">
          {slides.map((slide) => (
            <button
              key={slide.idx}
              onClick={() => setActiveSlide(slide.idx)}
              className={cn(
                'w-6 h-[3px] bg-gray1 dark:bg-gray3 rounded-[2px] cursor-pointer border-none p-0 transition-all duration-[180ms] ease',
                activeSlide === slide.idx && 'bg-orange dark:bg-orange w-10'
              )}
              aria-label={`Слайд ${slide.idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
