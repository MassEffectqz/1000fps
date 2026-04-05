import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { vi } from 'vitest';

// Очищать после каждого теста
afterEach(() => {
  cleanup();
});

// Мок для next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/admin',
  useParams: () => ({}),
}));

// Мок для next/image
vi.mock('next/image', () => ({
  default: (props: React.ComponentProps<'img'>) => {
    const { src, alt, ...rest } = props;
    return { type: 'img', props: { src: src || '', alt: alt || '', ...rest } };
  },
}));

// Мок для sonner
vi.mock('sonner', () => ({
  Toaster: () => null,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));
