'use client';

import { useState } from 'react';
import { useCart } from '@/lib/context/cart-context';
import type { WarehouseWithStock } from '@/lib/actions/warehouse';

interface WarehouseSelectorProps {
  productId: string;
  warehouses: WarehouseWithStock[];
}

export function WarehouseSelector({
  warehouses,
  productId,
}: WarehouseSelectorProps) {
  const { addToCart, isUpdatingItem } = useCart();
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getQuantity = (warehouseId: string) => quantities[warehouseId] || 1;

  const handleQuantityChange = (warehouseId: string, delta: number, max: number) => {
    const current = getQuantity(warehouseId);
    const newQty = Math.max(1, Math.min(current + delta, max));
    setQuantities(prev => ({ ...prev, [warehouseId]: newQty }));
  };

  const handleAddToCart = async (warehouseId: string) => {
    if (isAdding || isUpdatingItem) return;
    setIsAdding(warehouseId);
    try {
      await addToCart(productId, getQuantity(warehouseId), warehouseId);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(null);
    }
  };

  const handleBuyNow = async (warehouseId: string) => {
    if (isAdding || isUpdatingItem) return;
    setIsAdding(warehouseId);
    try {
      await addToCart(productId, getQuantity(warehouseId), warehouseId);
      window.location.href = '/cart';
    } catch (error) {
      console.error('Error buying now:', error);
    } finally {
      setIsAdding(null);
    }
  };

  if (warehouses.length === 0) {
    return (
      <div className="p-4 bg-black2 border border-gray1 rounded-[var(--radius)]">
        <p className="text-[13px] text-gray4">
          Товар временно недоступен на складах
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black2 border border-gray1 rounded-[var(--radius)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-[10px] border-b border-gray1 bg-black3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-orange">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span className="font-display text-[12px] font-bold text-white2 uppercase tracking-wider">
          Склад
        </span>
      </div>

      {/* Warehouses */}
      <div className="divide-y divide-gray1">
        {warehouses.map((warehouse) => (
          <div
            key={warehouse.id}
            className="px-3 py-3"
          >
            {/* Desktop layout */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Warehouse name + stock */}
              <div className="flex-shrink-0 w-[160px]">
                <div className="font-body text-[13px] font-medium text-white2 leading-tight">
                  {warehouse.name}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-gray3">
                    {warehouse.city}
                  </span>
                  {warehouse.inStock ? (
                    <span className="text-[11px] text-green-500 font-medium">
                      {warehouse.quantity} шт.
                    </span>
                  ) : (
                    <span className="text-[11px] text-red-500 font-medium">
                      Нет в наличии
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="flex-shrink-0 w-[110px]">
                <span className="font-display text-[16px] font-extrabold text-white2">
                  {warehouse.formattedPrice}
                </span>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Quantity stepper */}
              <div className="flex-shrink-0">
                <div className="flex items-center gap-1 bg-black3 border border-gray1 rounded-[var(--radius)]">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(warehouse.id, -1, warehouse.quantity)}
                    className="w-8 h-8 flex items-center justify-center text-gray4 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={getQuantity(warehouse.id) <= 1 || !warehouse.inStock}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  <span className="w-8 text-center text-[14px] font-semibold text-white2 tabular-nums">
                    {getQuantity(warehouse.id)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(warehouse.id, 1, warehouse.quantity)}
                    className="w-8 h-8 flex items-center justify-center text-gray4 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={!warehouse.inStock || getQuantity(warehouse.id) >= warehouse.quantity}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleAddToCart(warehouse.id)}
                  disabled={!warehouse.inStock || isAdding !== null}
                  className="h-[38px] px-5 bg-black3 border border-gray1 rounded-[var(--radius)] text-[12px] font-semibold text-gray4 hover:text-white hover:border-orange transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAdding === warehouse.id ? '...' : 'В корзину'}
                </button>
                <button
                  type="button"
                  onClick={() => handleBuyNow(warehouse.id)}
                  disabled={!warehouse.inStock || isAdding !== null}
                  className="h-[38px] px-6 bg-orange rounded-[var(--radius)] text-[12px] font-bold text-white hover:bg-orange2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAdding === warehouse.id ? '...' : 'Купить'}
                </button>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="flex sm:hidden flex-col gap-3">
              {/* Name + Stock */}
              <div>
                <div className="font-body text-[13px] font-medium text-white2 leading-tight">
                  {warehouse.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-gray3">
                    {warehouse.city}
                  </span>
                  {warehouse.inStock ? (
                    <span className="text-[11px] text-green-500 font-medium">
                      {warehouse.quantity} шт.
                    </span>
                  ) : (
                    <span className="text-[11px] text-red-500 font-medium">
                      Нет в наличии
                    </span>
                  )}
                </div>
              </div>

              {/* Price + Actions */}
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-[18px] font-extrabold text-white2">
                  {warehouse.formattedPrice}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(warehouse.id)}
                    disabled={!warehouse.inStock || isAdding !== null}
                    className="h-[36px] px-4 bg-black3 border border-gray1 rounded-[var(--radius)] text-[12px] font-semibold text-gray4 hover:text-white hover:border-orange transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isAdding === warehouse.id ? '...' : 'В корзину'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBuyNow(warehouse.id)}
                    disabled={!warehouse.inStock || isAdding !== null}
                    className="h-[36px] px-5 bg-orange rounded-[var(--radius)] text-[12px] font-bold text-white hover:bg-orange2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isAdding === warehouse.id ? '...' : 'Купить'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
