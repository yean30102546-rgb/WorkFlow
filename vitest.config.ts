import { defineConfig, defaultExclude } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    exclude: [...defaultExclude, 'legacy/**', '**/legacy-vite/**', 'tests/**'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

