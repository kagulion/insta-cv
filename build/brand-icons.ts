import { createRequire } from 'node:module';
import type { Plugin } from 'vite';

const VIRTUAL_ID = 'virtual:brand-icons';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

type IconSet = {
  readonly height: number;
  readonly width: number;
  readonly icons: Readonly<Record<string, { readonly body: string; readonly width?: number }>>;
};

/**
 * Модуль `virtual:brand-icons`: только перечисленные иконки из `@iconify-json/fa6-brands`
 * вместо всего набора. Неизвестное имя останавливает сборку.
 */
export const brandIcons = (names: readonly string[]): Plugin => ({
  name: 'brand-icons',
  resolveId: (id) => (id === VIRTUAL_ID ? RESOLVED_ID : undefined),
  load(id) {
    if (id !== RESOLVED_ID) return undefined;
    const set = createRequire(import.meta.url)('@iconify-json/fa6-brands/icons.json') as IconSet;
    const missing = names.filter((name) => set.icons[name] === undefined);
    if (missing.length > 0) {
      this.error(`нет таких иконок в fa6-brands: ${missing.join(', ')}`);
    }
    const icons = Object.fromEntries(
      names.map((name) => {
        const icon = set.icons[name];
        return [name, { body: icon?.body ?? '', width: icon?.width ?? set.width }];
      })
    );
    return `export const height = ${set.height};\nexport const icons = ${JSON.stringify(icons)};\n`;
  }
});
