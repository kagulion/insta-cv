import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { fontPreload } from './build/font-preload.ts';
import { seo } from './build/seo.ts';

export default defineConfig({
  // Относительные пути: одна страница без роутинга открывается из любой подпапки (GitHub Pages).
  base: './',
  build: {
    // Нижняя граница Tailwind 4: ниже ломаются `oklch`, `color-mix` и `@property`. См. README.
    target: ['chrome111', 'firefox128', 'safari16.4']
  },
  server: {
    host: '127.0.0.1'
  },
  plugins: [
    preact(),
    tailwindcss(),
    fontPreload(['latin', 'cyrillic']),
    seo(process.env.SITE_URL ?? 'https://kagulion.github.io/insta-cv/')
  ],
  test: {
    include: ['src/**/*.test.ts']
  }
});
