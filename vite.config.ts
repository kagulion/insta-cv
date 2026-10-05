import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Относительные пути: одна страница без роутинга открывается из любой подпапки (GitHub Pages).
  base: './',
  server: {
    host: '127.0.0.1'
  },
  plugins: [preact(), tailwindcss()],
  test: {
    include: ['src/**/*.test.ts']
  }
});
