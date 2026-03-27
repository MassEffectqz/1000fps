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
        black: {
          DEFAULT: '#0a0a0a',
          2: '#111111',
          3: '#1a1a1a',
          4: '#222222',
        },
        gray: {
          1: '#2e2e2e',
          2: '#444444',
          3: '#888888',
          4: '#bbbbbb',
        },
        white: {
          DEFAULT: '#f0f0f0',
          2: '#ffffff',
        },
        orange: {
          DEFAULT: '#ff6a00',
          2: '#e05c00',
          3: '#ff8c33',
        },
      },
      fontFamily: {
        display: ['var(--font-barlow-condensed)', 'sans-serif'],
        body: ['var(--font-barlow)', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
