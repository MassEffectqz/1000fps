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
        <div className="container py-10">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray1 rounded-[var(--radius)]" />
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

        <div className="container py-10">
          <div className="text-center py-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-20 h-20 mx-auto mb-6 text-gray2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <h1 className="font-display text-[28px] font-extrabold uppercase text-white2 mb-3">Корзина пуста</h1>
            <p className="text-gray3 mb-8 max-w-md mx-auto">
              Похоже, вы ещё не добавили ни одного товара. Перейдите в каталог, чтобы выбрать комплектующие.
            </p>
            <Link href="/catalog">
              <Button size="lg">Перейти в каталог</Button>
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

      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-[28px] font-bold uppercase text-white2">
            Корзина ({cart.totalItems} {cart.totalItems === 1 ? 'товар' : cart.totalItems < 5 ? 'товара' : 'товаров'})
          </h1>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Очистить корзину
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className={`flex gap-4 p-4 bg-black2 border border-gray1 rounded-[var(--radius)] transition-opacity ${
                  removingIds.has(item.id) ? 'opacity-50' : ''
                }`}
              >
                {/* Image */}
                <div className="w-28 h-28 flex-shrink-0 bg-black3 border border-gray1 rounded-[var(--radius)] overflow-hidden">
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={112}
                      height={112}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="text-[14px] text-white2 hover:text-orange line-clamp-2 mb-2 font-display font-bold"
                  >
                    {item.product.name}
                  </Link>

                  <div className="flex items-center gap-4 mb-3">
                    {item.product.warehouse && (
                      <select
                        value={item.warehouseId || ''}
                        onChange={(e) => updateCartItem(item.id, item.quantity, e.target.value || undefined)}
                        className="text-[12px] bg-black3 border border-gray1 rounded-[var(--radius)] px-2 py-1 text-gray3 focus:border-orange focus:outline-none cursor-pointer"
                        disabled={!item.product.inStock}
                      >
                        <option value="">Выберите склад</option>
                        <option value={item.product.warehouse.id}>
                          {item.product.warehouse.city}, {item.product.warehouse.name}
                        </option>
                      </select>
                    )}
                    {item.product.inStock ? (
                      <span className="text-[12px] text-green-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        В наличии
                      </span>
                    ) : (
                      <span className="text-[12px] text-red-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        Нет в наличии
                      </span>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1), item.warehouseId || undefined)}
                        className="w-7 h-7 flex items-center justify-center bg-black3 border border-gray1 rounded-[var(--radius)] text-gray3 hover:border-orange hover:text-orange transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="text-[14px] text-white2 w-8 text-center font-display font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItem(item.id, item.quantity + 1, item.warehouseId || undefined)}
                        className="w-7 h-7 flex items-center justify-center bg-black3 border border-gray1 rounded-[var(--radius)] text-gray3 hover:border-orange hover:text-orange transition-colors"
                        disabled={!item.product.inStock || item.quantity >= item.product.availableQuantity}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-[13px] text-gray3 hover:text-red-500 transition-colors flex items-center gap-1"
                      disabled={removingIds.has(item.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                      Удалить
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="text-[18px] font-display font-bold text-white2">
                    {(item.product.finalPrice * item.quantity).toLocaleString('ru-RU')} ₽
                  </p>
                  {item.product.finalPrice !== item.product.price && (
                    <p className="text-[12px] text-gray3 line-through">
                      {(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽
                    </p>
                  )}
                  <p className="text-[11px] text-gray3 mt-1">
                    {item.product.finalPrice.toLocaleString('ru-RU')} ₽/шт
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-6 sticky top-[140px]">
              <h2 className="font-display text-[18px] font-bold uppercase text-white2 mb-4">
                Заказ
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-gray3">Товары ({cart.totalItems})</span>
                  <span className="text-white2">{cart.totalPrice.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-gray3">Скидка</span>
                  <span className="text-green-500">0 ₽</span>
                </div>
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-gray3">Доставка</span>
                  <span className="text-white2">Рассчитывается далее</span>
                </div>
              </div>

              <div className="border-t border-gray1 pt-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[16px] font-bold text-white2">Итого</span>
                  <span className="font-display text-[22px] font-bold text-orange">
                    {cart.totalPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>

              <Link href="/checkout">
                <Button variant="primary" fullWidth size="lg">
                  Оформить заказ
                </Button>
              </Link>

              <Link href="/catalog" className="block mt-3">
                <Button variant="secondary" fullWidth size="md">
                  Продолжить покупки
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
