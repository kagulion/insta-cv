import type { Plugin } from 'vite';

/**
 * Добавляет в `index.html` `<link rel="preload">` для основных начертаний шрифта. Имена файлов
 * с хешем известны только после сборки, поэтому вручную в HTML их не прописать. Без предзагрузки
 * браузер узнаёт о шрифте лишь после разбора CSS и показывает текст с запозданием.
 * В dev-режиме сборки нет, и плагин ничего не делает.
 */
export const fontPreload = (subsets: readonly string[]): Plugin => ({
  name: 'font-preload',
  transformIndexHtml: {
    order: 'post',
    handler(_html, context) {
      const files = Object.keys(context.bundle ?? {});
      return subsets.flatMap((subset) => {
        const file = files.find((name) => name.includes(`-${subset}-wght-normal-`));
        if (file === undefined) return [];
        return [
          {
            tag: 'link',
            attrs: {
              rel: 'preload',
              as: 'font',
              type: 'font/woff2',
              // Шрифты запрашиваются в режиме CORS, без атрибута предзагрузка пропадёт зря.
              crossorigin: '',
              href: `./${file}`
            },
            injectTo: 'head' as const
          }
        ];
      });
    }
  }
});
