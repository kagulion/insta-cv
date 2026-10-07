import type { Plugin } from 'vite';

const PLACEHOLDER = /%SITE_URL%/g;

/**
 * Адрес сайта для SEO и шаринга. В `index.html` вместо него стоит `%SITE_URL%`, а при сборке
 * плагин выкладывает `robots.txt` и `sitemap.xml` с тем же адресом. Адрес должен быть
 * абсолютным и заканчиваться на `/`: так требуют соцсети для картинок и `canonical`.
 */
export const seo = (siteUrl: string): Plugin => {
  if (!/^https?:\/\/.+\/$/.test(siteUrl)) {
    throw new Error(`адрес сайта должен быть абсолютным и оканчиваться на «/»: ${siteUrl}`);
  }
  return {
    name: 'seo',
    transformIndexHtml: (html) => html.replace(PLACEHOLDER, siteUrl),
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`
      });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}</loc>\n  </url>\n</urlset>\n`
      });
    }
  };
};
