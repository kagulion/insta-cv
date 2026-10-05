/**
 * Иконки брендов для контактов: отобранная часть Font Awesome 6 Brands. Полный набор весит
 * около 600 КБ, поэтому в сборку попадают только эти, их тела достаёт плагин в `vite.config.ts`.
 * Своя ссылка на сайт не из списка получит иконку «ссылка». Новый бренд добавляется сюда.
 */
export const BRAND_ICON_NAMES = [
  // мессенджеры и контакты из шапки
  'telegram',
  'whatsapp',
  'viber',
  'skype',
  'discord',
  'slack',
  'github',
  'gitlab',
  'bitbucket',
  'linkedin',
  // код и карьера
  'stack-overflow',
  'dev',
  'hashnode',
  'medium',
  'codepen',
  'kaggle',
  'hackerrank',
  'npm',
  'docker',
  'upwork',
  'product-hunt',
  'google-scholar',
  'orcid',
  'researchgate',
  // дизайн
  'behance',
  'dribbble',
  'figma',
  'artstation',
  'deviantart',
  'unsplash',
  'pinterest',
  // соцсети и контент
  'vk',
  'odnoklassniki',
  'yandex',
  'x-twitter',
  'facebook',
  'instagram',
  'threads',
  'bluesky',
  'mastodon',
  'tiktok',
  'reddit',
  'youtube',
  'vimeo',
  'twitch',
  'soundcloud',
  'spotify',
  'tumblr',
  'wordpress',
  'goodreads',
  // приложения и игры
  'apple',
  'app-store-ios',
  'android',
  'google-play',
  'steam',
  'itch-io'
] as const;

export type BrandIconName = (typeof BRAND_ICON_NAMES)[number];
