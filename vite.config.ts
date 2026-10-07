import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { brandIcons } from './build/brand-icons.ts';
import { fontPreload } from './build/font-preload.ts';
import { seo } from './build/seo.ts';
import { BRAND_ICON_NAMES } from './src/config/brand-list.ts';

export default defineConfig({
  // Относительные пути: одна страница без роутинга открывается из любой подпапки (GitHub Pages).
  base: './',
  server: {
    host: '127.0.0.1'
  },
  plugins: [
    preact(),
    tailwindcss(),
    brandIcons(BRAND_ICON_NAMES),
    fontPreload(['latin', 'cyrillic']),
    seo(process.env.SITE_URL ?? 'https://kagulion.github.io/insta-cv/')
  ],
  test: {
    include: ['src/**/*.test.ts']
  }
});
