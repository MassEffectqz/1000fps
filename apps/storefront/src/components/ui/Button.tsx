import type { ButtonHTMLAttributes} from 'react';
import { forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      style,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      borderRadius: 'var(--radius)',
      transition: 'var(--tr)',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.5 : 1,
      border: 'none',
      outline: 'none',
      ...style,
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: 'var(--orange)',
        color: '#fff',
      },
      outline: {
        background: 'transparent',
        color: 'var(--orange)',
        border: '1px solid var(--orange)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--gray4)',
        border: '1px solid var(--gray1)',
      },
      danger: {
        background: '#dc2626',
        color: '#fff',
      },
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        padding: '6px 14px',
        fontSize: '11px',
      },
      md: {
        padding: '10px 22px',
        fontSize: '13px',
      },
      lg: {
        padding: '14px 32px',
        fontSize: '15px',
      },
    };

    const widthStyle: React.CSSProperties = fullWidth ? { width: '100%' } : {};

    return (
      <button
        ref={ref}
        style={{
          ...baseStyles,
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...widthStyle,
        }}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ width: '16px', height: '16px' }}
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        )}
        {!loading && leftIcon && <span>{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
