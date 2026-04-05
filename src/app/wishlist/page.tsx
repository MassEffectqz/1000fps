'use client';

import { useCart } from '@/lib/context/cart-context';
import { Breadcrumbs, Button, ProductCard } from '@/components/ui';
import Link from 'next/link';
import { useState } from 'react';

export default function WishlistPage() {
  const {
    wishlist,
    isLoading,
    removeFromWishlist,
    wishlistToCart,
  } = useCart();

  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleRemove = async (itemId: string) => {
    setRemovingIds(prev => new Set(prev).add(itemId));
    await removeFromWishlist(itemId);
    setRemovingIds(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleSelect = (itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === wishlist.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(wishlist.items.map(item => item.id)));
    }
  };

  const handleMoveToCart = async () => {
    const itemIds = selectedItems.size > 0
      ? Array.from(selectedItems)
      : undefined;

    await wishlistToCart(itemIds);
    setSelectedItems(new Set());
  };

  if (isLoading) {
    return (
      <>
        <div className="bg-black2 border-b border-gray1">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Вишлист' }]} />
          </div>
        </div>
        <div className="container py-10">
          <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-80 bg-gray1 rounded-[var(--radius)]" />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (wishlist.items.length === 0) {
    return (
      <>
        <div className="bg-black2 border-b border-gray1">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Вишлист' }]} />
          </div>
        </div>

        <div className="container py-10">
          <div className="text-center py-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-20 h-20 mx-auto mb-6 text-gray2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h1 className="font-display text-[28px] font-extrabold uppercase text-white2 mb-3">
              Вишлист пуст
            </h1>
            <p className="text-gray3 mb-8 max-w-md mx-auto">
              Сохраняйте понравившиеся товары, чтобы вернуться к ним позже.
            </p>
            <Link href="/catalog">
              <Button size="lg">Перейти в каталог</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const totalPrice = wishlist.items.reduce((sum, item) => sum + (item.product.finalPrice || item.product.price || 0), 0);
  const allSelected = selectedItems.size === wishlist.items.length && wishlist.items.length > 0;

  return (
    <>
      <div className="bg-black2 border-b border-gray1">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Вишлист' }]} />
        </div>
      </div>

      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-[28px] font-bold uppercase text-white2">
            Вишлист ({wishlist.totalItems} {wishlist.totalItems === 1 ? 'товар' : wishlist.totalItems < 5 ? 'товара' : 'товаров'})
          </h1>

          <div className="flex items-center gap-3">
            {selectedItems.size > 0 && (
              <Button
                variant="primary"
                size="md"
                onClick={handleMoveToCart}
              >
                Добавить {selectedItems.size} {selectedItems.size === 1 ? 'товар' : selectedItems.size < 5 ? 'товара' : 'товаров'} в корзину
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
            >
              {allSelected ? 'Снять выделение' : 'Выделить все'}
            </Button>
          </div>
        </div>

        {/* Grid с ProductCard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          {wishlist.items.map((item) => (
            <div
              key={item.id}
              className={`relative ${removingIds.has(item.id) ? 'opacity-50' : ''}`}
            >
              {/* Selection checkbox */}
              <div className="absolute top-2 left-2 z-20">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleSelect(item.id)}
                    className="w-4 h-4 rounded border-gray2 bg-black3/50 text-orange focus:ring-orange focus:ring-offset-0 cursor-pointer"
                  />
                </label>
              </div>

              {/* Product Card */}
              <ProductCard
                id={item.product.id}
                name={item.product.name}
                price={item.product.finalPrice || item.product.price || 0}
                oldPrice={item.product.oldPrice ?? undefined}
                image={item.product.image ?? undefined}
                rating={item.product.rating}
                reviewCount={item.product.reviewCount}
                badges={item.product.badges}
                href={`/product/${item.product.slug}`}
                inStock={item.product.inStock ?? true}
              />

              {/* Remove button */}
              <button
                onClick={() => handleRemove(item.id)}
                className="w-full mt-2 text-[12px] text-gray4 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5 py-2"
                disabled={removingIds.has(item.id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Удалить
              </button>
            </div>
          ))}
        </div>

        {/* Summary bar */}
        <div className="bg-black2 border border-gray1 rounded-[var(--radius)] p-4 flex items-center justify-between">
          <div>
            <p className="text-[14px] text-gray3 mb-1">
              Выбрано товаров: {selectedItems.size}
            </p>
            <p className="font-display text-[18px] font-bold text-white2">
              {selectedItems.size > 0
                ? wishlist.items
                    .filter(item => selectedItems.has(item.id))
                    .reduce((sum, item) => sum + (item.product.finalPrice || item.product.price || 0), 0)
                    .toLocaleString('ru-RU')
                : totalPrice.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setSelectedItems(new Set())}
            >
              Снять выделение
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleMoveToCart}
              disabled={selectedItems.size === 0}
            >
              Перенести в корзину
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
