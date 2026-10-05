import brands from '@iconify-json/fa6-brands/icons.json';

/** Имя иконки для ссылки без известного бренда: обычная иконка «ссылка». */
export const GENERIC_ICON = 'link';

/** Домены, чьё название не совпадает с именем иконки FA6. */
const HOST_ICONS: Readonly<Record<string, string>> = {
  'x.com': 'x-twitter',
  'twitter.com': 'x-twitter',
  't.me': 'telegram',
  'youtu.be': 'youtube',
  'wa.me': 'whatsapp',
  'stackoverflow.com': 'stack-overflow',
  'scholar.google.com': 'google-scholar'
};

const aliases: Readonly<Record<string, { readonly parent: string }>> = brands.aliases;
const icons: Readonly<Record<string, { readonly body: string; readonly width?: number }>> =
  brands.icons;

/** Иконка бренда по имени или псевдониму из набора Font Awesome 6 Brands. */
export const findBrandIcon = (name: string) => {
  const key = aliases[name]?.parent ?? name;
  return icons[key] === undefined ? undefined : { ...icons[key], key };
};

export const isKnownIcon = (name: string): boolean =>
  name === GENERIC_ICON || findBrandIcon(name) !== undefined;

/** Иконка по домену: сначала таблица исключений, потом имя домена второго уровня (`behance.net` → `behance`). */
export const detectIcon = (hostname: string): string => {
  const host = hostname.replace(/^www\./, '').toLowerCase();
  const fromTable = HOST_ICONS[host];
  if (fromTable !== undefined) return fromTable;
  const name = host.split('.').slice(-2, -1)[0];
  return name !== undefined && findBrandIcon(name) !== undefined ? name : GENERIC_ICON;
};
