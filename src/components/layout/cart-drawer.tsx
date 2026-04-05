'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCart } from '@/lib/context/cart-context';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateCartItem,
    isLoading,
    isUpdatingItem,
  } = useCart();

  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsCartDrawerOpen(false);
      setIsClosing(false);
    }, 200);
  }, [setIsCartDrawerOpen]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isCartDrawerOpen, handleClose]);

  // Блокировка прокрутки фона
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] transition-opacity duration-200',
          isClosing ? 'opacity-0' : 'opacity-100'
        )}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md bg-black2 border-l border-gray1 z-[9999]',
          'transform transition-transform duration-200 ease-out',
          isClosing ? 'translate-x-full' : 'translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray1">
            <h2 className="font-display text-[18px] font-bold uppercase text-white2">
              Корзина
              {cart.totalItems > 0 && (
                <span className="text-gray3 text-[14px] font-normal ml-2">
                  ({cart.totalItems} {cart.totalItems === 1 ? 'товар' : cart.totalItems < 5 ? 'товара' : 'товаров'})
                </span>
              )}
            </h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center text-gray3 hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
              </div>
            ) : cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-20 h-20 text-gray2 mb-4">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <p className="text-white2 font-display text-[16px] font-bold uppercase mb-2">
                  Корзина пуста
                </p>
                <p className="text-gray3 text-[13px] mb-6">
                  Добавьте товары из каталога
                </p>
                <Link href="/catalog">
                  <Button variant="primary" size="md">
                    Перейти в каталог
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-black3 border border-gray1 rounded-[var(--radius)]"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 flex-shrink-0 bg-black2 border border-gray1 rounded-[var(--radius)] overflow-hidden">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray2">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
                            <rect x="2" y="7" width="20" height="14" rx="2" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="text-[13px] text-white2 hover:text-orange line-clamp-2 mb-1"
                      >
                        {item.product.name}
                      </Link>
                      
                      {item.product.warehouse && (
                        <p className="text-[11px] text-gray3 mb-2">
                          Склад: {item.product.warehouse.city}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1), item.warehouseId || undefined)}
                            className={cn(
                              'w-6 h-6 flex items-center justify-center bg-black2 border border-gray1 rounded text-gray3 transition-colors',
                              isUpdatingItem || item.quantity <= 1
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:border-orange hover:text-orange'
                            )}
                            disabled={isUpdatingItem || item.quantity <= 1}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                              <path d="M5 12h14" />
                            </svg>
                          </button>
                          <span className="text-[13px] text-white2 w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartItem(item.id, item.quantity + 1, item.warehouseId || undefined)}
                            className={cn(
                              'w-6 h-6 flex items-center justify-center bg-black2 border border-gray1 rounded text-gray3 transition-colors',
                              isUpdatingItem || !item.product.inStock || item.quantity >= item.product.availableQuantity
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:border-orange hover:text-orange'
                            )}
                            disabled={isUpdatingItem || !item.product.inStock || item.quantity >= item.product.availableQuantity}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-[14px] font-display font-bold text-white2">
                            {(item.product.finalPrice * item.quantity).toLocaleString('ru-RU')} ₽
                          </p>
                          {item.product.finalPrice !== item.product.price && (
                            <p className="text-[11px] text-gray3 line-through">
                              {(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray3 hover:text-red-500 transition-colors self-start"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-t border-gray1 px-6 py-4 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-gray3">Итого:</span>
                <span className="font-display text-[20px] font-bold text-white2">
                  {cart.totalPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Link href="/cart" className="block" onClick={handleClose}>
                  <Button variant="primary" fullWidth size="lg">
                    Оформить заказ
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  fullWidth
                  size="md"
                  onClick={() => {
                    handleClose();
                    window.location.href = '/catalog';
                  }}
                >
                  Продолжить покупки
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
