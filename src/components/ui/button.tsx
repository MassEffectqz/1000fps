import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-display font-bold uppercase tracking-wider
      rounded-[var(--radius)]
      transition-all duration-[180ms] ease
      focus:outline-none focus:ring-2 focus:ring-orange/50 focus:ring-offset-2 focus:ring-offset-black
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variantStyles = {
      primary: 'bg-orange text-white hover:bg-orange2 hover:text-white',
      secondary: 'bg-gray1 text-white border border-gray2 hover:bg-gray2 hover:text-white2',
      outline: 'bg-transparent text-orange border border-orange hover:bg-orange hover:text-white',
      ghost: 'bg-transparent text-gray4 border border-gray1 hover:border-gray2 hover:text-white',
      danger: 'bg-transparent text-red-500 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500',
      orange: 'bg-orange text-white hover:bg-orange2 hover:text-white',
    };

    const sizeStyles = {
      sm: 'px-[14px] py-[6px] text-[11px]',
      md: 'px-[22px] py-[10px] text-[13px]',
      lg: 'px-[32px] py-[14px] text-[15px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], fullWidth && 'w-full', className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
