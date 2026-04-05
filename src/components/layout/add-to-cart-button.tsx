'use client';

import { useState } from 'react';
import { useCart } from '@/lib/context/cart-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  warehouseId?: string;
  inStock?: boolean;
  className?: string;
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export function AddToCartButton({
  productId,
  quantity = 1,
  warehouseId,
  inStock = true,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
}: AddToCartButtonProps) {
  const { addToCart, isInCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const alreadyInCart = isInCart(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!inStock || isAdding) return;

    setIsAdding(true);
    await addToCart(productId, quantity, warehouseId);
    setIsAdding(false);
  };

  const baseChildren = children || (alreadyInCart ? 'В корзине' : 'В корзину');

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={handleClick}
      disabled={!inStock || isAdding}
      className={cn(
        alreadyInCart && 'bg-green-600 hover:bg-green-700 text-white',
        !inStock && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {isAdding ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="0.75" />
          </svg>
          Добавление...
        </>
      ) : (
        baseChildren
      )}
    </Button>
  );
}
