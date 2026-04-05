import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            `
            block w-full
            px-[14px] py-[9px]
            bg-black3 border rounded-[var(--radius)]
            text-white text-[14px]
            transition-colors duration-[180ms] ease
            focus:border-orange
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none cursor-pointer
          `,
            error && 'border-red-500 focus:border-red-500',
            !error && 'border-gray1',
            className
          )}
          ref={ref}
          {...props}
        >
          {options ? (
            options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray3 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
