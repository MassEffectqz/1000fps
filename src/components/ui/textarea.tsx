import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
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
          resize-y min-h-[100px]
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

Textarea.displayName = 'Textarea';

export { Textarea };
