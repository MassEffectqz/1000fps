'use client';

import { useCart } from '@/lib/context/cart-context';
import { Breadcrumbs, Button } from '@/components/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function CartPage() {
  const {
    cart,
    isLoading,
    removeFromCart,
    updateCartItem,
    clearCart,
  } = useCart();

  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const handleRemove = async (itemId: string) => {
    setRemovingIds(prev => new Set(prev).add(itemId));
    await removeFromCart(itemId);
    setRemovingIds(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleClear = async () => {
    if (confirm('Вы уверены, что хотите очистить корзину?')) {
      await clearCart();
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="bg-black2 border-b border-gray1">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Корзина' }]} />
          </div>
        </div>
        <div className="container py-6 lg:py-10">
          <div className="animate-pulse space-y-3 lg:space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 lg:h-32 bg-gray1 rounded-[var(--radius)]" />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (cart.items.length === 0) {
    return (
      <>
        <div className="bg-black2 border-b border-gray1">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Корзина' }]} />
          </div>
        </div>

        <div className="container py-8 lg:py-10">
          <div className="text-center py-12 lg:py-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 text-gray2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <h1 className="font-display text-xl lg:text-[28px] font-extrabold uppercase text-white2 mb-2 lg:mb-3">Корзина пуста</h1>
            <p className="text-gray3 mb-6 lg:mb-8 max-w-xs lg:max-w-md mx-auto text-sm lg:text-base">
              Похоже, вы ещё не добавили ни одного товара. Перейдите в каталог, чтобы выбрать комплектующие.
            </p>
            <Link href="/catalog">
              <Button size="md" className="text-sm lg:text-base">В каталог</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-black2 border-b border-gray1">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Корзина' }]} />
        </div>
      </div>

      <div className="container py-6 lg:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 lg:mb-6">
          <h1 className="font-display text-xl lg:text-[28px] font-bold uppercase text-white2">
            Корзина ({cart.totalItems} {cart.totalItems === 1 ? 'товар' : cart.totalItems < 5 ? 'товара' : 'товаров'})
          </h1>
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs lg:text-sm">
            Очистить
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3 lg:space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-black2 border border-gray1 rounded-[var(--radius)] transition-opacity ${
                  removingIds.has(item.id) ? 'opacity-50' : ''
                }`}
              >
                {/* Image */}
                <div className="w-full sm:w-20 lg:w-24 h-20 sm:h-20 lg:h-24 flex-shrink-0 bg-black3 border border-gray1 rounded-[var(--radius)] overflow-hidden">
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 lg:w-10 lg:h-10">
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="text-sm lg:text-[14px] text-white2 hover:text-orange line-clamp-2 mb-2 font-display font-bold block"
                  >
                    {item.product.name}
                  </Link>

                  <div className="flex flex-wrap items-center gap-2 lg:gap-4 mb-2 lg:mb-3">
                    {item.product.warehouse && (
                      <select
                        value={item.warehouseId || ''}
                        onChange={(e) => updateCartItem(item.id, item.quantity, e.target.value || undefined)}
                        className="text-[11px] lg:text-[12px] bg-black3 border border-gray1 rounded-[var(--radius)] px-2 py-1 text-gray3 focus:border-orange focus:outline-none cursor-pointer"
                        disabled={!item.product.inStock}
                      >
                        <option value="">Склад</option>
                        <option value={item.product.warehouse.id}>
                          {item.product.warehouse.city}
                        </option>
                      </select>
                    )}
                    {item.product.inStock ? (
                      <span className="text-[11px] lg:text-[12px] text-green-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        В наличии
                      </span>
                    ) : (
                      <span className="text-[11px] lg:text-[12px] text-red-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        Нет
                      </span>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                    <div className="flex items-center gap-1.5 lg:gap-2">
                      <button
                        onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1), item.warehouseId || undefined)}
                        className="w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center bg-black3 border border-gray1 rounded-[var(--radius)] text-gray3 hover:border-orange hover:text-orange transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5 lg:w-3 lg:h-3">
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="text-[13px] lg:text-[14px] text-white2 w-6 lg:w-8 text-center font-display font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItem(item.id, item.quantity + 1, item.warehouseId || undefined)}
                        className="w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center bg-black3 border border-gray1 rounded-[var(--radius)] text-gray3 hover:border-orange hover:text-orange transition-colors"
                        disabled={!item.product.inStock || item.quantity >= item.product.availableQuantity}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5 lg:w-3 lg:h-3">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-[12px] lg:text-[13px] text-gray3 hover:text-red-500 transition-colors flex items-center gap-1"
                      disabled={removingIds.has(item.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 lg:w-4 lg:h-4">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                      <span className="hidden sm:inline">Удалить</span>
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="flex sm:flex-col sm:text-right items-center justify-between sm:justify-start sm:items-end gap-2 sm:gap-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray1 sm:border-none">
                  <p className="text-base lg:text-[18px] font-display font-bold text-white2">
                    {(item.product.finalPrice * item.quantity).toLocaleString('ru-RU')} ₽
                  </p>
                  {item.product.finalPrice !== item.product.price && (
                    <p className="text-[10px] lg:text-[12px] text-gray3 line-through">
                      {(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽
                    </p>
                  )}
                  <p className="text-[10px] lg:text-[11px] text-gray3">
                    {item.product.finalPrice.toLocaleString('ru-RU')} ₽/шт
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4 lg:p-6 sticky top-[100px] lg:top-[140px]">
              <h2 className="font-display text-base lg:text-[18px] font-bold uppercase text-white2 mb-3 lg:mb-4">
                Заказ
              </h2>

              <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                <div className="flex items-center justify-between text-[13px] lg:text-[14px]">
                  <span className="text-gray3">Товары ({cart.totalItems})</span>
                  <span className="text-white2">{cart.totalPrice.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex items-center justify-between text-[13px] lg:text-[14px]">
                  <span className="text-gray3">Скидка</span>
                  <span className="text-green-500">0 ₽</span>
                </div>
                <div className="flex items-center justify-between text-[13px] lg:text-[14px]">
                  <span className="text-gray3">Доставка</span>
                  <span className="text-white2">Далее</span>
                </div>
              </div>

              <div className="border-t border-gray1 pt-3 lg:pt-4 mb-4 lg:mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm lg:text-[16px] font-bold text-white2">Итого</span>
                  <span className="font-display text-lg lg:text-[22px] font-bold text-orange">
                    {cart.totalPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>

              <Link href="/checkout">
                <Button variant="primary" fullWidth size="lg" className="text-sm lg:text-base">
                  Оформить
                </Button>
              </Link>

              <Link href="/catalog" className="block mt-2 lg:mt-3">
                <Button variant="secondary" fullWidth size="sm" className="text-xs lg:text-sm">
                  Продолжить
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
