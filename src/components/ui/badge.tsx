import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'orange' | 'gray' | 'white' | 'outline' | 'green' | 'red' | 'blue' | 'yellow';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'orange', children, className }: BadgeProps) {
  const baseStyles = `
    inline-flex items-center
    font-display text-[9px] font-bold uppercase
    px-[6px] py-[2px]
    rounded-[var(--radius)]
    transition-colors duration-[180ms] ease
    max-w-[120px] truncate
  `;

  const variantStyles = {
    orange: 'bg-orange/10 text-orange border border-orange/20',
    gray: 'bg-black3 text-gray4 border border-gray1',
    white: 'bg-white text-black border border-white/20',
    outline: 'border border-orange text-orange bg-transparent',
    green: 'bg-[rgba(0,230,118,0.1)] text-[#00e676] border border-[rgba(0,230,118,0.2)]',
    red: 'bg-[rgba(255,23,68,0.1)] text-[#ff1744] border border-[rgba(255,23,68,0.2)]',
    blue: 'bg-[rgba(68,138,255,0.1)] text-[#448aff] border border-[rgba(68,138,255,0.2)]',
    yellow: 'bg-[rgba(255,214,0,0.1)] text-[#ffd600] border border-[rgba(255,214,0,0.2)]',
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], className)}>
      {children}
    </span>
  );
}
