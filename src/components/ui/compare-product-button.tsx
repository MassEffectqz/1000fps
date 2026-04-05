'use client';

import { useCompare } from '@/lib/context/compare-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CompareProductButtonProps {
  productId: string;
  className?: string;
}

export function CompareProductButton({ productId, className }: CompareProductButtonProps) {
  const { addToCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(productId);

  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (inCompare) {
          toast.info('Товар уже в сравнении');
        } else {
          await addToCompare(productId);
        }
      }}
      className={cn(
        'w-8 h-8 flex-shrink-0 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray3 transition-colors',
        'hover:border-gray2 hover:text-white',
        inCompare && 'border-orange text-orange',
        className
      )}
      title={inCompare ? 'В сравнении' : 'Сравнить'}
      type="button"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-4 h-4"
      >
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    </button>
  );
}
