import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-[6px] py-[14px] text-[12px] text-gray3 border-b border-gray1',
        className
      )}
    >
      {items.map((item, index) => (
        <div key={`${item.href || item.label}-${index}`} className="flex items-center gap-[6px] whitespace-nowrap">
          {index > 0 && <span className="text-gray2">/</span>}
          {index === items.length - 1 ? (
            <span className="text-white truncate max-w-[200px] sm:max-w-[300px] md:max-w-none" title={item.label}>
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href || '#'}
              className="text-gray3 hover:text-orange transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
