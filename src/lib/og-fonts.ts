import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { inflateSync } from 'node:zlib';

export type OgFont = {
  readonly name: 'Geist' | 'Geist Cyrillic';
  readonly data: Buffer;
  readonly weight: 400 | 700;
  readonly style: 'normal';
};

export type OgFontsResult =
  | { readonly ok: true; readonly fonts: readonly OgFont[] }
  | { readonly ok: false; readonly message: string };

const FONT_FILES = [
  { file: 'geist-latin-400-normal.woff', name: 'Geist', weight: 400 },
  { file: 'geist-latin-700-normal.woff', name: 'Geist', weight: 700 },
  { file: 'geist-cyrillic-400-normal.woff', name: 'Geist Cyrillic', weight: 400 },
  { file: 'geist-cyrillic-700-normal.woff', name: 'Geist Cyrillic', weight: 700 }
] as const;

const require = createRequire(import.meta.url);

/**
 * Satori берёт глифы из одного шрифта на (имя, вес), поэтому кириллица идёт отдельным именем,
 * а в `fontFamily` оба имени перечислены как запасные друг для друга.
 */
export const OG_FONT_FAMILY = 'Geist, "Geist Cyrillic"';

/**
 * Satori плохо читает сжатый woff (глифы подменяются на «тофу»), поэтому оборачиваем woff в обычный sfnt:
 * переносим таблицы в новый каталог и распаковываем их zlib.
 */
const unwrapWoff = (woff: Buffer): Buffer => {
  const tableCount = woff.readUInt16BE(12);
  const dirSize = 12 + 16 * tableCount;
  const header = Buffer.alloc(dirSize);
  woff.copy(header, 0, 4, 8);
  header.writeUInt16BE(tableCount, 4);
  const entrySelector = Math.floor(Math.log2(tableCount));
  const searchRange = 2 ** entrySelector * 16;
  header.writeUInt16BE(searchRange, 6);
  header.writeUInt16BE(entrySelector, 8);
  header.writeUInt16BE(tableCount * 16 - searchRange, 10);
  const tables: Buffer[] = [];
  let offset = dirSize;
  for (let i = 0; i < tableCount; i++) {
    const entry = 44 + i * 20;
    const stored = woff.subarray(
      woff.readUInt32BE(entry + 4),
      woff.readUInt32BE(entry + 4) + woff.readUInt32BE(entry + 8)
    );
    const length = woff.readUInt32BE(entry + 12);
    const data = stored.length < length ? inflateSync(stored) : stored;
    const slot = 12 + i * 16;
    woff.copy(header, slot, entry, entry + 4);
    header.writeUInt32BE(woff.readUInt32BE(entry + 16), slot + 4);
    header.writeUInt32BE(offset, slot + 8);
    header.writeUInt32BE(length, slot + 12);
    const padded = Buffer.concat([data, Buffer.alloc((4 - (data.length % 4)) % 4)]);
    tables.push(padded);
    offset += padded.length;
  }
  return Buffer.concat([header, ...tables]);
};

/** Край: читает четыре статичных woff (satori не понимает woff2) и отдаёт их как sfnt. Нет файла, значит `ok: false` с его именем. */
export const loadOgFonts = async (): Promise<OgFontsResult> => {
  try {
    const fonts = await Promise.all(
      FONT_FILES.map(async ({ file, name, weight }) => ({
        name,
        data: unwrapWoff(await readFile(require.resolve(`@fontsource/geist/files/${file}`))),
        weight,
        style: 'normal' as const
      }))
    );
    return { ok: true, fonts };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      message: `не удалось загрузить шрифт для OG картинки (нужны ${FONT_FILES.map((f) => f.file).join(', ')} из @fontsource/geist): ${reason}`
    };
  }
};
