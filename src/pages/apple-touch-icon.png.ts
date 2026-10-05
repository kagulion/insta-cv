import { Resvg } from '@resvg/resvg-js';
import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';

const SIZE = 180;

// Край: iOS не понимает SVG-иконки, поэтому PNG рисуется из исходника на сборке.
export const GET: APIRoute = async () => {
  const svg = await readFile('src/assets/app-icon.svg');
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: SIZE } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
