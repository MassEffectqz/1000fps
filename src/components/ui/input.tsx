import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          `
          block w-full
          px-[14px] py-[9px]
          bg-black3 border rounded-[var(--radius)]
          text-white text-[14px]
          transition-colors duration-[180ms] ease
          placeholder:text-gray3
          focus:border-orange
          disabled:opacity-50 disabled:cursor-not-allowed
        `,
          error && 'border-red-500 focus:border-red-500',
          !error && 'border-gray1',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
