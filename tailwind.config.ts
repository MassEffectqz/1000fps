import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: 'var(--color-black)',
        black2: 'var(--color-black2)',
        black3: 'var(--color-black3)',
        black4: 'var(--color-black4)',
        gray1: 'var(--color-gray1)',
        gray2: 'var(--color-gray2)',
        gray3: 'var(--color-gray3)',
        gray4: 'var(--color-gray4)',
        white: 'var(--color-white)',
        white2: 'var(--color-white2)',
        orange: 'var(--color-orange)',
        orange2: 'var(--color-orange2)',
        orange3: 'var(--color-orange3)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      transitionDuration: {
        DEFAULT: '180ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
        '4xl': 'var(--spacing-4xl)',
      },
    },
  },
  plugins: [],
};

export default config;
