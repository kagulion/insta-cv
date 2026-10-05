import type { APIRoute } from 'astro';
import { loadConfig } from '../config';
import { buildRobots } from '../lib/crawl';

export const GET: APIRoute = () => {
  const { seo } = loadConfig();
  return new Response(buildRobots(seo), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
