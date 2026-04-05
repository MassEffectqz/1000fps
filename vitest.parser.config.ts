import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./parser/wb-interceptor/test-setup.js'],
    include: ['parser/wb-interceptor/**/*.test.js'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['parser/wb-interceptor/**/*.js'],
      exclude: ['parser/wb-interceptor/**/*.test.js'],
    },
  },
});
