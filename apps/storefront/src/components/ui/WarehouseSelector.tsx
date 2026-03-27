import { useState } from 'react';
import type { WarehouseStock } from '@/types';

export interface WarehouseSelectorProps {
  warehouseStock: WarehouseStock[];
  selectedWarehouseId?: number;
  onChange?: (warehouseId: number) => void;
}

export function WarehouseSelector({
  warehouseStock,
  selectedWarehouseId,
  onChange,
}: WarehouseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!warehouseStock || warehouseStock.length === 0) {
    return null;
  }

  const selectedWarehouse = warehouseStock.find(
    (s) => s.warehouseId === selectedWarehouseId
  );

  const handleSelect = (warehouseId: number) => {
    onChange?.(warehouseId);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '8px 12px',
          background: 'var(--black3)',
          border: '1px solid var(--gray1)',
          borderRadius: 'var(--radius)',
          color: 'var(--white)',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'border-color var(--tr)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ width: '16px', height: '16px', color: 'var(--orange)' }}
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {selectedWarehouse
            ? `${selectedWarehouse.warehouse.city} — ${selectedWarehouse.warehouse.address}`
            : 'Выберите склад'}
        </span>
        <span
          style={{
            fontSize: '10px',
            color: 'var(--gray3)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform var(--tr)',
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--black2)',
            border: '1px solid var(--gray1)',
            borderRadius: 'var(--radius)',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {warehouseStock.map((stock) => {
            const available = stock.quantity - stock.reserved;
            const isSelected = stock.warehouseId === selectedWarehouseId;

            return (
              <button
                key={stock.warehouseId}
                onClick={() => handleSelect(stock.warehouseId)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  width: '100%',
                  padding: '10px 12px',
                  background: isSelected ? 'var(--black3)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--gray1)',
                  color: 'var(--white)',
                  fontSize: '13px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background var(--tr)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>
                    {stock.warehouse.city}
                  </span>
                  {isSelected && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--orange)',
                        fontWeight: 600,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--gray3)' }}>
                  {stock.warehouse.address}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: available > 0 ? 'var(--green)' : 'var(--red)',
                    fontWeight: 500,
                  }}
                >
                  {available > 0
                    ? `В наличии: ${available} шт.`
                    : 'Нет в наличии'}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WarehouseSelector;
