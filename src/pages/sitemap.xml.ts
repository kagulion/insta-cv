import type { APIRoute } from 'astro';
import { loadConfig } from '../config';
import { buildSitemap } from '../lib/crawl';

export const GET: APIRoute = () => {
  const sitemap = buildSitemap(loadConfig().seo);
  return sitemap === undefined
    ? new Response(null, { status: 404 })
    : new Response(sitemap, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
