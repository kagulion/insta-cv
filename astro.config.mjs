/* global process */
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  // На GitHub Pages сайт лежит в подпапке репозитория, путь задаёт CI.
  base: process.env.BASE_PATH ?? '/',
  server: {
    host: '127.0.0.1'
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
