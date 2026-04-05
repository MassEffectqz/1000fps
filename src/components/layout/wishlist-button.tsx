'use client';

import { useCart } from '@/lib/context/cart-context';
import Link from 'next/link';

export function WishlistButton() {
  const { wishlist } = useCart();
  const quantity = wishlist.totalItems;

  return (
    <>
      <Link href="/wishlist" className="hbtn" data-tip="Избранное">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="hbtn__label">Вишлист</span>
        {quantity > 0 && (
          <span className="hbtn__badge">{quantity > 99 ? '99+' : quantity}</span>
        )}
      </Link>
    </>
  );
}
