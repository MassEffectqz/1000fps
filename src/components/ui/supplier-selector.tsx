'use client';

import { useState } from 'react';
import { useCart } from '@/lib/context/cart-context';
import { cn } from '@/lib/utils';
import type { WarehouseWithStock } from '@/lib/actions/warehouse';

export interface SupplierData {
  id: string;
  source: string;
  price: number;
  oldPrice?: number | null;
  deliveryTime: string;
  inStock: boolean;
  rating?: number;
  reviewsCount?: number;
  url?: string;
}

interface SupplierSelectorProps {
  productId: string;
  suppliers: SupplierData[];
  warehouses?: WarehouseWithStock[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function SupplierSelector({
  productId,
  suppliers,
  warehouses = [],
  onRefresh,
  isLoading = false,
}: SupplierSelectorProps) {
  const { addToCart, isUpdatingItem } = useCart();
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleAddToCart = async (supplierId: string, quantity: number = 1, warehouseId?: string) => {
    if (isAdding || isUpdatingItem) return;
    setIsAdding(supplierId);
    try {
      console.log('[SupplierSelector] Adding to cart:', supplierId, quantity, warehouseId);
      await addToCart(productId, quantity, warehouseId || undefined, supplierId);
      console.log('[SupplierSelector] Added to cart successfully');
    } catch (error) {
      console.error('[SupplierSelector] Error adding to cart:', error);
    } finally {
      setIsAdding(null);
    }
  };

  const handleBuyNow = async (supplierId: string, quantity: number = 1, warehouseId?: string) => {
    if (isAdding || isUpdatingItem) return;
    setIsAdding(supplierId);
    try {
      console.log('[SupplierSelector] Buying now:', supplierId, quantity, warehouseId);
      await addToCart(productId, quantity, warehouseId || undefined, supplierId);
      console.log('[SupplierSelector] Redirecting to cart');
      window.location.href = '/cart';
    } catch (error) {
      console.error('[SupplierSelector] Error buying now:', error);
    } finally {
      setIsAdding(null);
    }
  };

  const getSourceName = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '').split('.')[0].toUpperCase();
    } catch {
      return 'Поставщик';
    }
  };

  const getSourceIcon = (url: string) => {
    const domain = url.toLowerCase();
    if (domain.includes('wildberries')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );
    }
    if (domain.includes('ozon')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
        <path d="M20 7h-9M14 17H5M12 3v18"/>
      </svg>
    );
  };

  if (suppliers.length === 0) {
    return (
      <div className="p-4 bg-black2 border border-gray1 rounded-[var(--radius)]">
        <p className="text-[13px] text-gray4">
          Поставщики не найдены
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black2 border border-gray1 rounded-[var(--radius)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-[10px] bg-black3">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 flex-1 hover:bg-black2 transition-colors -mx-3 px-3 py-[10px]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-orange">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          <span className="font-display text-[12px] font-bold text-white2 uppercase tracking-wider">
            Ещё поставщики
          </span>
          <span className="text-[10px] text-gray3 bg-black2 px-1.5 py-0.5 rounded">
            {suppliers.length}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={cn('w-4 h-4 text-gray4 transition-transform duration-200 ml-auto', isCollapsed ? '' : 'rotate-180')}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="w-7 h-7 flex items-center justify-center bg-black2 border border-gray1 rounded-[var(--radius)] text-gray4 hover:text-orange hover:border-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2 flex-shrink-0"
            title="Обновить данные"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')}>
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        )}
      </div>

      {/* Suppliers List */}
      <div className={cn(
        'divide-y divide-gray1 overflow-hidden transition-all duration-200',
        isCollapsed ? 'max-h-0' : 'max-h-[800px]'
      )}>
        {suppliers.map((supplier) => {
          const sourceName = supplier.source || supplier.url || 'Поставщик';
          const formattedPrice = supplier.price.toLocaleString('ru-RU') + ' ₽';

          return (
            <div
              key={supplier.id}
              className="px-3 py-3"
            >
              {/* Desktop layout */}
              <div className="hidden sm:grid sm:grid-cols-[180px_1fr_130px_auto] gap-3 items-center">
                {/* Supplier name + Rating */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className="text-orange flex-shrink-0">
                      {getSourceIcon(supplier.url || '')}
                    </div>
                    <div className="font-body text-[13px] font-semibold text-white2 truncate">
                      {supplier.source || 'Поставщик'}
                    </div>
                  </div>
                  {supplier.rating && (
                    <div className="text-[11px] flex items-center gap-1">
                      <span className="text-orange">
                        {'★'.repeat(Math.floor(supplier.rating))}
                        {'☆'.repeat(5 - Math.floor(supplier.rating))}
                      </span>
                      {supplier.reviewsCount && (
                        <span className="text-gray3">({supplier.reviewsCount})</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Stock + Delivery */}
                <div className="flex items-center gap-3 text-[12px]">
                  <div className="flex items-center gap-1">
                    {supplier.inStock ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-green-500">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-red-500">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                    <span className={supplier.inStock ? 'text-green-500' : 'text-red-500'}>
                      {supplier.inStock ? 'В наличии' : 'Нет'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{supplier.deliveryTime}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <span className="font-display text-[18px] font-bold text-white2">
                    {formattedPrice}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(supplier.id, 1)}
                    disabled={!supplier.inStock || isAdding !== null}
                    className="h-[36px] px-4 bg-black3 border border-gray1 rounded-[var(--radius)] text-[12px] font-medium text-gray4 hover:text-white hover:border-orange disabled:opacity-40"
                  >
                    {isAdding === supplier.id ? '...' : 'В корзину'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBuyNow(supplier.id, 1)}
                    disabled={!supplier.inStock || isAdding !== null}
                    className="h-[36px] px-5 bg-orange rounded-[var(--radius)] text-[12px] font-bold text-white hover:bg-orange2 disabled:opacity-40"
                  >
                    {isAdding === supplier.id ? '...' : 'Купить'}
                  </button>
                </div>
              </div>

              {/* Mobile layout */}
              <div className="flex sm:hidden flex-col gap-2.5">
                {/* Source + Rating */}
                <div className="flex items-center gap-1.5">
                  <div className="text-orange flex-shrink-0">
                    {getSourceIcon(supplier.url || '')}
                  </div>
                  <div className="font-body text-[13px] font-semibold text-white2 leading-tight">
                    {supplier.source || 'Поставщик'}
                  </div>
                  {supplier.rating && (
                    <>
                      <span className="text-[11px] text-orange ml-1">
                        {'★'.repeat(Math.floor(supplier.rating))}
                      </span>
                      {supplier.reviewsCount && (
                        <span className="text-[10px] text-gray3">
                          ({supplier.reviewsCount})
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Stock + Delivery */}
                <div className="flex items-center gap-1.5 text-[11px]">
                  {supplier.inStock ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-green-500 flex-shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-red-500 flex-shrink-0">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                  <span className={cn(
                    'font-medium',
                    supplier.inStock ? 'text-green-500' : 'text-red-500'
                  )}>
                    {supplier.inStock ? 'В наличии' : 'Нет'}
                  </span>
                  <span className="text-gray3">•</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5 text-gray3 flex-shrink-0">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="text-gray3">
                    {supplier.deliveryTime}
                  </span>
                </div>

                {/* Price + Actions */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="font-display text-[18px] font-extrabold text-white2">
                    {formattedPrice}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(supplier.id, 1)}
                      disabled={!supplier.inStock || isAdding !== null}
                      className="h-[36px] px-4 bg-black3 border border-gray1 rounded-[var(--radius)] text-[12px] font-medium text-gray4 hover:text-white hover:border-orange transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isAdding === supplier.id ? '...' : 'В корзину'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBuyNow(supplier.id, 1)}
                      disabled={!supplier.inStock || isAdding !== null}
                      className="h-[36px] px-5 bg-orange rounded-[var(--radius)] text-[12px] font-bold text-white hover:bg-orange2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isAdding === supplier.id ? '...' : 'Купить'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
