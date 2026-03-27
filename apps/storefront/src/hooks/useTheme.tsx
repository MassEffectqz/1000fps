'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = '1000fps-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;

    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Check system preference
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      setThemeState(prefersLight ? 'light' : 'dark');
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    // Apply theme to document
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    // Save to localStorage
    localStorage.setItem(THEME_KEY, theme);
  }, [theme, isLoaded]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Listen for system theme changes (only if user hasn't manually set preference)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (!savedTheme) {
        setThemeState(e.matches ? 'light' : 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
