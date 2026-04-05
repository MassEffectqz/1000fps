'use client';

import { useState } from 'react';
import { useCart } from '@/lib/context/cart-context';
import { cn } from '@/lib/utils';

interface AddToWishlistButtonProps {
  productId: string;
  className?: string;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md' | 'lg';
}

export function AddToWishlistButton({
  productId,
  className,
  variant = 'icon',
  size = 'md',
}: AddToWishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, wishlist, isInWishlist } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const wishlistItem = wishlist.items.find(item => item.productId === productId);
  const isInList = isInWishlist(productId);
  const itemId = wishlistItem?.id;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessing) return;

    setIsProcessing(true);
    
    if (isInList && itemId) {
      await removeFromWishlist(itemId);
    } else {
      await addToWishlist(productId);
    }
    
    setIsProcessing(false);
  };

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] border transition-colors',
          isInList
            ? 'bg-orange text-white border-orange'
            : 'bg-transparent text-gray3 border-gray1 hover:border-orange hover:text-orange',
          isProcessing && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <svg viewBox="0 0 24 24" fill={isInList ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {isInList ? 'В вишлисте' : 'В вишлист'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className={cn(
        'flex-shrink-0 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center transition-colors',
        isInList
          ? 'border-orange text-orange bg-orange/10'
          : 'text-gray3 hover:border-orange hover:text-orange hover:bg-orange/5',
        isProcessing && 'opacity-50 cursor-not-allowed',
        sizeClasses[size],
        className
      )}
      title={isInList ? 'Удалить из вишлиста' : 'Добавить в вишлист'}
    >
      <svg viewBox="0 0 24 24" fill={isInList ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
