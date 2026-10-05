import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { brandIcons } from './build/brand-icons';
import { BRAND_ICON_NAMES } from './src/config/brand-list';

export default defineConfig({
  // Относительные пути: одна страница без роутинга открывается из любой подпапки (GitHub Pages).
  base: './',
  server: {
    host: '127.0.0.1'
  },
  plugins: [preact(), tailwindcss(), brandIcons(BRAND_ICON_NAMES)],
  test: {
    include: ['src/**/*.test.ts']
  }
});
