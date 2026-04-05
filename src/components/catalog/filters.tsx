'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FilterBlockProps {
  title: string;
  isOpen?: boolean;
  children: React.ReactNode;
}

export function FilterBlock({ title, isOpen = true, children }: FilterBlockProps) {
  const [open, setOpen] = useState(isOpen);

  return (
    <div className={cn('border-b border-gray1', open && 'is-open')}>
      <div
        className="flex items-center justify-between px-4 py-[13px] cursor-pointer text-[13px] font-semibold text-white2 select-none"
        onClick={() => setOpen(!open)}
      >
        {title}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn('w-[14px] h-[14px] text-gray3 transition-transform', open && 'rotate-180')}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {open && <div className="px-4 pb-[14px]">{children}</div>}
    </div>
  );
}

interface FilterCheckProps {
  label: string;
  checked?: boolean;
  count?: number;
  onChange?: (checked: boolean) => void;
}

export function FilterCheck({ label, checked = false, count, onChange }: FilterCheckProps) {
  return (
    <label className="flex items-center justify-between py-[5px] cursor-pointer">
      <div className="flex items-center flex-1">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only"
        />
        <div
          className={cn(
            'w-4 h-4 flex-shrink-0 bg-black3 border border-gray2 rounded-[1px] flex items-center justify-center mr-2 transition-colors',
            checked && 'bg-orange border-orange'
          )}
        >
          {checked && (
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" className="w-[10px] h-[10px]">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <span className={cn('text-[13px] transition-colors', checked ? 'text-white' : 'text-gray4')}>
          {label}
        </span>
      </div>
      {count !== undefined && <span className="text-[11px] text-gray3">{count}</span>}
    </label>
  );
}

interface RangeInputProps {
  min?: number;
  max?: number;
  valueMin?: number;
  valueMax?: number;
}

export function RangeInput({ min = 0, max = 100000, valueMin, valueMax }: RangeInputProps) {
  return (
    <div>
      <div className="flex gap-2 items-center mt-[10px]">
        <input
          type="number"
          defaultValue={valueMin}
          placeholder="От"
          className="flex-1 bg-black3 border border-gray1 rounded-[var(--radius)] px-[10px] py-[7px] text-white text-[13px] outline-none transition-colors focus:border-orange"
        />
        <span className="text-gray3 text-[13px]">—</span>
        <input
          type="number"
          defaultValue={valueMax}
          placeholder="До"
          className="flex-1 bg-black3 border border-gray1 rounded-[var(--radius)] px-[10px] py-[7px] text-white text-[13px] outline-none transition-colors focus:border-orange"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        defaultValue={valueMax}
        className="w-full mt-3 accent-orange"
      />
    </div>
  );
}
