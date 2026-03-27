import type { InputHTMLAttributes} from 'react';
import { forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, leftIcon, rightIcon, fullWidth = true, style, ...props },
    ref
  ) => {
    const baseStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 14px',
      background: 'var(--black3)',
      border: '1px solid var(--gray1)',
      borderRadius: 'var(--radius)',
      color: 'var(--white)',
      fontSize: '14px',
      outline: 'none',
      transition: 'var(--tr)',
      width: fullWidth ? '100%' : 'auto',
      ...style,
    };

    const errorStyles: React.CSSProperties = error ? { borderColor: 'var(--orange)' } : {};

    return (
      <div style={{ width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              color: 'var(--gray3)',
              marginBottom: '6px',
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftIcon && (
            <span
              style={{
                position: 'absolute',
                left: '12px',
                color: 'var(--gray3)',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            style={{
              ...baseStyles,
              ...errorStyles,
              paddingLeft: leftIcon ? '36px' : '14px',
              paddingRight: rightIcon ? '36px' : '14px',
            }}
            {...props}
          />
          {rightIcon && (
            <span
              style={{
                position: 'absolute',
                right: '12px',
                color: 'var(--gray3)',
                pointerEvents: 'none',
              }}
            >
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <span
            style={{
              display: 'block',
              fontSize: '11px',
              color: 'var(--orange)',
              marginTop: '4px',
            }}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
