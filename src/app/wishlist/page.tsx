'use client';

import { useCart } from '@/lib/context/cart-context';
import { Breadcrumbs, Button, ProductCard } from '@/components/ui';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function WishlistPage() {
  const {
    wishlist,
    isLoading,
    removeFromWishlist,
    wishlistToCart,
  } = useCart();

  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showMobileActions, setShowMobileActions] = useState(false);

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
    setShowMobileActions(false);
  };

  if (isLoading) {
    return (
      <>
        <div className="bg-black2 border-b border-gray1">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Вишлист' }]} />
          </div>
        </div>
        <div className="container py-6 sm:py-10">
          <div className="animate-pulse grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 sm:h-80 bg-gray1 rounded-[var(--radius)]" />
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

        <div className="container py-10 sm:py-16">
          <div className="text-center py-12 sm:py-20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-gray2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h1 className="font-display text-[22px] sm:text-[28px] font-extrabold uppercase text-white2 mb-2 sm:mb-3">
              Вишлист пуст
            </h1>
            <p className="text-gray3 text-sm mb-6 sm:mb-8 max-w-md mx-auto px-4">
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
  const selectedTotal = selectedItems.size > 0
    ? wishlist.items.filter(item => selectedItems.has(item.id)).reduce((sum, item) => sum + (item.product.finalPrice || item.product.price || 0), 0)
    : 0;

  return (
    <>
      <div className="bg-black2 border-b border-gray1">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Вишлист' }]} />
        </div>
      </div>

      <div className="container py-4 sm:py-10 pb-20 lg:pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <h1 className="font-display text-[22px] sm:text-[28px] font-bold uppercase text-white2">
            Вишлист ({wishlist.totalItems})
          </h1>

          <div className="flex items-center gap-2 sm:gap-3">
            {selectedItems.size > 0 && (
              <Button
                variant="primary"
                size="sm"
                className="sm:hidden flex-1"
                onClick={() => setShowMobileActions(true)}
              >
                В корзину ({selectedItems.size})
              </Button>
            )}
            <button
              onClick={handleSelectAll}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[12px] sm:text-[13px] text-gray3 hover:text-orange transition-colors px-3 py-2 rounded-[var(--radius)] bg-black2 border border-gray1 sm:border-0"
            >
              {allSelected ? 'Снять все' : 'Все'}
            </button>
          </div>
        </div>

        {/* Grid с ProductCard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {wishlist.items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'relative',
                removingIds.has(item.id) && 'opacity-50 pointer-events-none'
              )}
            >
              {/* Selection checkbox — touch-friendly */}
              <button
                onClick={() => handleSelect(item.id)}
                className={cn(
                  'absolute top-2 left-2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all',
                  selectedItems.has(item.id)
                    ? 'bg-orange text-white shadow-lg shadow-orange/30'
                    : 'bg-black3/80 text-gray3 backdrop-blur-sm border border-gray1 hover:border-orange'
                )}
                aria-label={selectedItems.has(item.id) ? 'Снять выделение' : 'Выделить'}
              >
                {selectedItems.has(item.id) ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <rect x="3" y="3" width="18" height="18" rx="4" />
                  </svg>
                )}
              </button>

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

              {/* Remove button — touch-friendly */}
              <button
                onClick={() => handleRemove(item.id)}
                disabled={removingIds.has(item.id)}
                className="w-full mt-2 min-h-[44px] text-[12px] sm:text-[13px] text-gray4 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5 py-2.5 rounded-[var(--radius)] hover:bg-red-500/5"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Удалить
              </button>
            </div>
          ))}
        </div>

        {/* Summary bar — desktop */}
        <div className="hidden sm:block bg-black2 border border-gray1 rounded-[var(--radius)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] text-gray3 mb-1">
                {selectedItems.size > 0
                  ? `Выбрано: ${selectedItems.size} ${selectedItems.size === 1 ? 'товар' : selectedItems.size < 5 ? 'товара' : 'товаров'}`
                  : `Всего: ${wishlist.totalItems} ${wishlist.totalItems === 1 ? 'товар' : wishlist.totalItems < 5 ? 'товара' : 'товаров'}`}
              </p>
              <p className="font-display text-[18px] font-bold text-white2">
                {(selectedItems.size > 0 ? selectedTotal : totalPrice).toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="lg" onClick={handleSelectAll}>
                {allSelected ? 'Снять выделение' : 'Выделить все'}
              </Button>
              <Button variant="primary" size="lg" onClick={handleMoveToCart} disabled={selectedItems.size === 0}>
                Перенести в корзину
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet for actions */}
      {showMobileActions && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileActions(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-black2 border-t border-gray1 rounded-t-[var(--radius)] p-4 pb-6 max-h-[70vh] overflow-y-auto">
            {/* Handle */}
            <div className="w-10 h-1 bg-gray2 rounded-full mx-auto mb-4" />

            <h3 className="font-display text-[16px] font-bold uppercase text-white2 mb-4">
              Выбрано {selectedItems.size} {selectedItems.size === 1 ? 'товар' : selectedItems.size < 5 ? 'товара' : 'товаров'}
            </h3>

            {/* Selected items preview */}
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {wishlist.items
                .filter(item => selectedItems.has(item.id))
                .map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-black3 rounded-[var(--radius)] p-2">
                    {item.product.image && (
                      <img src={item.product.image} alt="" className="w-10 h-10 object-cover rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-white2 truncate">{item.product.name}</div>
                    </div>
                    <div className="text-[13px] font-bold text-orange whitespace-nowrap">
                      {(item.product.finalPrice || item.product.price || 0).toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                ))}
            </div>

            <div className="border-t border-gray1 pt-4">
              <div className="flex justify-between mb-4">
                <span className="text-gray3">Итого:</span>
                <span className="font-display text-[20px] font-bold text-white2">{selectedTotal.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" fullWidth size="lg" onClick={() => setShowMobileActions(false)}>
                  Отмена
                </Button>
                <Button variant="primary" fullWidth size="lg" onClick={handleMoveToCart}>
                  В корзину
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
