import { height, icons } from 'virtual:brand-icons';

/** Иконка бренда по имени: тело SVG и размеры для `viewBox`. */
export const findBrandIcon = (name: string) => {
  const icon = icons[name];
  return icon === undefined ? undefined : { ...icon, height };
};
