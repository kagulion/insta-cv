import type { Cv } from '../config';
import { withTrailingSlash } from './links';

type SeoConfig = Cv['seo'];

/** Карта сайта нужна, когда известен адрес и страница открыта для индексации. */
const sitemapUrl = (seo: SeoConfig): string | undefined =>
  seo?.url === undefined || seo.noindex === true ? undefined : new URL(seo.url).href;

/** `robots.txt`: закрытая от индексации страница запрещена целиком, иначе всё открыто. */
export const buildRobots = (seo: SeoConfig): string => {
  const url = sitemapUrl(seo);
  return [
    'User-agent: *',
    seo?.noindex === true ? 'Disallow: /' : 'Allow: /',
    ...(url === undefined
      ? []
      : [`Sitemap: ${new URL('sitemap.xml', withTrailingSlash(url)).href}`]),
    ''
  ].join('\n');
};

/** `sitemap.xml` из одной страницы. Нет адреса или стоит `noindex`, значит карты нет. */
export const buildSitemap = (seo: SeoConfig): string | undefined => {
  const url = sitemapUrl(seo);
  return url === undefined
    ? undefined
    : `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url}</loc></url></urlset>\n`;
};
