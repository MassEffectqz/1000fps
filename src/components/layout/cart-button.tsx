'use client';

import { useCart } from '@/lib/context/cart-context';
import Link from 'next/link';

export function CartButton() {
  const { getCartQuantity, setIsCartDrawerOpen } = useCart();
  const quantity = getCartQuantity();

  return (
    <>
      <button
        className="hbtn hbtn--cart"
        onClick={() => setIsCartDrawerOpen(true)}
        data-tip="Корзина"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        <span className="hbtn__label">Корзина</span>
        {quantity > 0 && (
          <span className="hbtn__badge">{quantity > 99 ? '99+' : quantity}</span>
        )}
      </button>
      
      {/* Ссылка на страницу корзины для доступности */}
      <Link href="/cart" className="sr-only">
        Перейти в корзину
      </Link>
    </>
  );
}
