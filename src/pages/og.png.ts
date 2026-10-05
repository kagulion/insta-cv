import { readFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';
import type { APIRoute } from 'astro';
import satori from 'satori';
import { loadConfig } from '../config';
import { buildOgMarkup } from '../lib/og-card';
import { loadOgFonts } from '../lib/og-fonts';
import { OG_HEIGHT, OG_WIDTH } from '../lib/seo';

// Край: единственное место, где читаются шрифты и рисуется картинка.
const pngResponse = (png: Uint8Array<ArrayBuffer>) =>
  new Response(png, { headers: { 'Content-Type': 'image/png' } });

export const GET: APIRoute = async () => {
  const cv = loadConfig();
  const fonts = await loadOgFonts();
  if (!fonts.ok) {
    // Нет шрифтов: вместо падения сборки отдаём заготовку и говорим об этом.
    console.warn(`og.png: ${fonts.message}. Использована заготовка src/assets/og.png.`);
    return pngResponse(new Uint8Array(await readFile('src/assets/og.png')));
  }
  const markup = buildOgMarkup({
    name: cv.name,
    position: cv.position
  });
  // Дерево объектов satori совместимо по форме с ReactNode, но тип пакета его не принимает.
  const svg = await satori(markup as unknown as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [...fonts.fonts]
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();
  return pngResponse(new Uint8Array(png));
};
