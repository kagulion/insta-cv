/**
 * Иконки брендов для контактов шапки: отобранная часть Font Awesome 6 Brands. Полный набор
 * весит около 600 КБ, поэтому в сборку попадают только эти, их тела достаёт плагин в
 * `vite.config.ts`. Остальные контакты получают общую иконку.
 */
export const BRAND_ICON_NAMES = ['telegram', 'github', 'linkedin'] as const;

export type BrandIconName = (typeof BRAND_ICON_NAMES)[number];
