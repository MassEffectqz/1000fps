'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, required, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
            {label}
            {required && <span className="text-orange ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none transition-colors',
            'focus:border-orange',
            error && 'border-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-[11px] text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-[11px] text-gray4">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, required, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
            {label}
            {required && <span className="text-orange ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none transition-colors resize-none',
            'focus:border-orange',
            error && 'border-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-[11px] text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-[11px] text-gray4">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  options: { value: string; label: string; disabled?: boolean }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, required, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
            {label}
            {required && <span className="text-orange ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none transition-colors appearance-none cursor-pointer',
            'focus:border-orange',
            error && 'border-red-500 focus:border-red-500',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-[11px] text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-[11px] text-gray4">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className={cn(
          'flex items-center gap-3 p-4 bg-black3 border border-gray1 rounded-[var(--radius)] cursor-pointer hover:border-gray2 transition-colors',
          error && 'border-red-500'
        )}>
          <input
            ref={ref}
            type="checkbox"
            className={cn('w-4 h-4 accent-orange', className)}
            {...props}
          />
          {label && <span className="text-[13px] font-semibold text-white">{label}</span>}
        </label>
        {error && (
          <p className="mt-1 text-[11px] text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

interface LabelProps {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ children, required, className }) => (
  <label className={cn('block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2', className)}>
    {children}
    {required && <span className="text-orange ml-1">*</span>}
  </label>
);

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, description, children, className }) => (
  <div className={cn('bg-black2 border border-gray1 rounded-[var(--radius)] p-6', className)}>
    {(title || description) && (
      <div className="mb-5">
        {title && (
          <h2 className="font-display text-[14px] font-bold uppercase tracking-wider text-white">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-[12px] text-gray4 mt-1">{description}</p>
        )}
      </div>
    )}
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-[var(--radius)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-orange text-white hover:bg-orange2',
      secondary: 'bg-black3 border border-gray1 text-gray4 hover:text-white hover:border-gray2',
      danger: 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20',
      ghost: 'text-gray4 hover:text-white hover:bg-black3',
    };

    const sizes = {
      sm: 'px-3 py-[6px] text-[12px]',
      md: 'px-5 py-[10px] text-[13px]',
      lg: 'px-6 py-[12px] text-[14px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
