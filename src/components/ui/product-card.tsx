'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { AddToCartButton } from '@/components/layout';
import { AddToWishlistButton } from '@/components/layout';
import { CompareProductButton } from './compare-product-button';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  specs?: string;
  badges?: Array<{
    text: string;
    variant?: 'orange' | 'gray' | 'white' | 'outline' | 'green' | 'red' | 'blue' | 'yellow';
  }>;
  href?: string;
  className?: string;
  inStock?: boolean;
}

export function ProductCard({
  id,
  name,
  price = 0,
  oldPrice,
  image,
  rating,
  reviewCount = 0,
  specs,
  badges = [],
  href = '#',
  className,
  inStock = true,
}: ProductCardProps) {

  return (
    <div
      className={cn(
        'group relative bg-black2 border border-gray1 rounded-[var(--radius)] overflow-hidden',
        'transition-colors duration-[180ms] ease',
        'hover:border-orange',
        'flex flex-col h-full',
        className
      )}
    >
      {/* Badges */}
      {badges.length > 0 && (
        <div className="absolute top-[6px] left-[6px] flex flex-col gap-[3px] z-10 max-w-[calc(100%-12px)]">
          {badges.map((badge, index) => (
            <Badge key={index} variant={badge.variant}>
              {badge.text}
            </Badge>
          ))}
        </div>
      )}

      {/* Image */}
      <div className="aspect-[4/3] flex items-center justify-center bg-black3 border-b border-gray1 p-2 sm:p-4 relative">
        {image ? (
          <Image
            src={image}
            alt={name}
            width={280}
            height={210}
            className="w-full h-full object-contain"
            sizes="(max-width: 768px) 100vw, 280px"
          />
        ) : (
          <svg
            className="w-[60px] h-[45px] sm:w-[110px] sm:h-[82px]"
            viewBox="0 0 120 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="10"
              y="22"
              width="100"
              height="54"
              rx="2"
              stroke="var(--color-gray2)"
              strokeWidth="2"
            />
            <rect
              x="20"
              y="29"
              width="28"
              height="38"
              rx="1"
              stroke="var(--color-orange)"
              strokeWidth="1.5"
            />
            <path
              d="M58 33h40M58 43h34M58 53h26"
              stroke="var(--color-gray3)"
              strokeWidth="1.5"
            />
            <path
              d="M28 76v5M92 76v5"
              stroke="var(--color-gray2)"
              strokeWidth="2"
            />
          </svg>
        )}
      </div>

      {/* Body */}
      <div className="p-2 sm:p-[11px] pb-1.5 sm:pb-[9px] flex flex-col flex-1 min-h-0">
        {/* Rating */}
        {rating !== undefined && rating !== null && (
          <div className="text-[10px] sm:text-[11px] text-orange mb-0.5 sm:mb-[5px] flex-shrink-0">
            {'★'.repeat(Math.floor(rating))}
            {'☆'.repeat(5 - Math.floor(rating))}
            {reviewCount > 0 && (
              <span className="text-gray3 text-[10px] sm:text-[11px] ml-1">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Name */}
        <Link
          href={href}
          className="text-[11px] sm:text-[12px] leading-[1.3] sm:leading-[1.4] text-white flex-1 mb-0.5 sm:mb-[5px] hover:text-orange line-clamp-2"
        >
          {name}
        </Link>

        {/* Specs */}
        {specs && (
          <div className="text-[10px] sm:text-[11px] text-gray3 leading-[1.3] sm:leading-[1.35] flex-shrink-0 line-clamp-2">
            {specs}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-2 sm:px-4 pb-2 sm:pb-4 pt-0 border-t border-gray1 flex flex-col gap-1.5 sm:gap-3 mt-auto">
        {/* Price */}
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="font-display font-extrabold text-[14px] sm:text-[18px] text-white2 leading-none whitespace-nowrap">
            {price.toLocaleString('ru-RU')} ₽
          </span>
          {oldPrice && (
            <span className="text-[10px] sm:text-[11px] text-gray3 line-through whitespace-nowrap">
              {oldPrice.toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <AddToCartButton
            productId={id}
            variant="primary"
            size="sm"
            inStock={inStock}
            className="flex-1 h-8 sm:h-9 text-[10px] sm:text-[11px] font-bold tracking-wide rounded-[var(--radius)] font-display uppercase whitespace-nowrap btn-cart px-1.5 sm:px-2"
          >
            В корзину
          </AddToCartButton>
          <AddToWishlistButton
            productId={id}
            size="sm"
          />
          <CompareProductButton
            productId={id}
          />
        </div>
      </div>
    </div>
  );
}
