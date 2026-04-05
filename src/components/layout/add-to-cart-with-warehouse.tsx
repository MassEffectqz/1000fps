'use client';

import { useState } from 'react';
import { useCart } from '@/lib/context/cart-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductWithWarehouse {
  id: string;
  productId: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  price: number;
  inStock: boolean;
}

interface AddToCartWithWarehouseProps {
  productId: string;
  warehouses: ProductWithWarehouse[];
  className?: string;
}

export function AddToCartWithWarehouse({
  productId,
  warehouses,
  className,
}: AddToCartWithWarehouseProps) {
  const { addToCart, isUpdatingItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);

  const handleAddToCart = async (warehouseId: string) => {
    if (isAdding || isUpdatingItem) return;

    setSelectedWarehouse(warehouseId);
    setIsAdding(true);

    try {
      await addToCart(productId, 1, warehouseId);
      setSelectedWarehouse(null);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setSelectedWarehouse(null);
    } finally {
      setIsAdding(false);
    }
  };

  if (warehouses.length === 0) {
    return (
      <Button variant="primary" size="sm" fullWidth disabled className={className}>
        Нет в наличии
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      {warehouses.length === 1 ? (
        // Один склад - простая кнопка
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={() => handleAddToCart(warehouses[0].warehouseId)}
          disabled={isAdding || isUpdatingItem || !warehouses[0].inStock}
          className={cn(
            className,
            isAdding && 'opacity-75 cursor-wait'
          )}
        >
          {isAdding ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="0.75" />
              </svg>
              Добавление...
            </>
          ) : (
            'В корзину'
          )}
        </Button>
      ) : (
        // Несколько складов - выпадающий список
        <div className="space-y-2">
          <div className="text-[11px] text-gray4 uppercase tracking-wider">
            Выберите склад:
          </div>
          <div className="space-y-1">
            {warehouses.map((warehouse) => (
              <button
                key={warehouse.warehouseId}
                onClick={() => handleAddToCart(warehouse.warehouseId)}
                disabled={isAdding || isUpdatingItem || !warehouse.inStock}
                className={cn(
                  'w-full flex items-center justify-between p-2 text-left border rounded-[var(--radius)] transition-colors',
                  selectedWarehouse === warehouse.warehouseId
                    ? 'border-orange bg-orange/5'
                    : 'border-gray1 hover:border-orange',
                  (!warehouse.inStock || isAdding || isUpdatingItem) && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    warehouse.inStock ? 'bg-green-500' : 'bg-red-500'
                  )} />
                  <span className="text-[12px] text-white2">
                    {warehouse.warehouseName}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-gray4">
                    {warehouse.quantity} шт.
                  </div>
                  <div className="text-[12px] font-bold text-orange">
                    {warehouse.price.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
