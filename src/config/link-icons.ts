import { height, icons } from 'virtual:brand-icons';
import { BRAND_ICON_NAMES } from './brand-list';

/** Имя иконки для ссылки без известного бренда: обычная иконка «ссылка». */
export const GENERIC_ICON = 'link';

/** Домены, чьё название не совпадает с именем иконки FA6. */
const HOST_ICONS: Readonly<Record<string, string>> = {
  'x.com': 'x-twitter',
  'twitter.com': 'x-twitter',
  't.me': 'telegram',
  'youtu.be': 'youtube',
  'wa.me': 'whatsapp',
  'vk.ru': 'vk',
  'ok.ru': 'odnoklassniki',
  'dev.to': 'dev',
  'bsky.app': 'bluesky',
  'itch.io': 'itch-io',
  'stackoverflow.com': 'stack-overflow',
  'scholar.google.com': 'google-scholar',
  'producthunt.com': 'product-hunt'
};

const KNOWN: ReadonlySet<string> = new Set(BRAND_ICON_NAMES);

/** Иконка бренда по имени: тело SVG и размеры для `viewBox`. */
export const findBrandIcon = (name: string) => {
  const icon = icons[name];
  return icon === undefined ? undefined : { ...icon, height };
};

export const isKnownIcon = (name: string): boolean => name === GENERIC_ICON || KNOWN.has(name);

/** Иконка по домену: сначала таблица исключений, потом имя домена второго уровня (`behance.net` → `behance`). */
export const detectIcon = (hostname: string): string => {
  const host = hostname.replace(/^www\./, '').toLowerCase();
  const fromTable = HOST_ICONS[host];
  if (fromTable !== undefined) return fromTable;
  const name = host.split('.').slice(-2, -1)[0];
  return name !== undefined && KNOWN.has(name) ? name : GENERIC_ICON;
};
