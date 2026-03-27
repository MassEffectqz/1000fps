'use client';

import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title={theme === 'light' ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        background: 'var(--black3)',
        border: '1px solid var(--gray1)',
        borderRadius: 'var(--radius)',
        color: 'var(--gray4)',
        transition: 'var(--tr)',
        cursor: 'pointer',
      }}
    >
      {/* Sun icon for light theme */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{
          width: '18px',
          height: '18px',
          display: theme === 'light' ? 'none' : 'block',
        }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>

      {/* Moon icon for dark theme */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{
          width: '18px',
          height: '18px',
          display: theme === 'dark' ? 'none' : 'block',
        }}
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>

      <span
        style={{
          fontSize: '11px',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        Тема
      </span>
    </button>
  );
}
