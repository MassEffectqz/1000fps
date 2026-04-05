import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer';
}

export function Card({ children, className, as = 'div' }: CardProps) {
  const Component = as;

  return (
    <Component
      className={cn(
        'bg-black2 border border-gray1 rounded-[var(--radius)]',
        className
      )}
    >
      {children}
    </Component>
  );
}
