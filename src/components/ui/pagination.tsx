import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l !== undefined) {
        if (typeof i === 'number' && i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (typeof i === 'number' && i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = typeof i === 'number' ? i : l;
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-1 pt-5 pb-5 border-t border-gray1 bg-black2 px-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'min-w-9 h-9 flex items-center justify-center bg-black3 border border-gray1 rounded-[var(--radius)] text-[13px] font-display font-semibold transition-colors',
          currentPage === 1
            ? 'text-gray5 cursor-not-allowed'
            : 'text-gray4 cursor-pointer hover:border-gray2 hover:text-white'
        )}
      >
        ←
      </button>

      {getVisiblePages().map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={cn(
              'min-w-9 h-9 flex items-center justify-center border rounded-[var(--radius)] font-display font-semibold transition-colors',
              page === currentPage
                ? 'bg-orange border-orange text-white'
                : 'bg-black3 border-gray1 text-[13px] text-gray4 cursor-pointer hover:border-gray2 hover:text-white'
            )}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="text-gray3 px-1 text-[13px]">
            {page}
          </span>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'min-w-9 h-9 flex items-center justify-center bg-black3 border border-gray1 rounded-[var(--radius)] text-gray3 cursor-pointer transition-colors hover:border-gray2 hover:text-white',
          currentPage === totalPages && 'text-gray5 cursor-not-allowed'
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px]">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <span className="ml-auto text-[12px] text-gray3">
        Страница <strong className="text-white">{currentPage} из {totalPages}</strong>
      </span>
    </div>
  );
}
