import { describe, expect, it } from 'vitest';
import { BRAND_ICON_NAMES } from './brand-list';
import { detectIcon, findBrandIcon, GENERIC_ICON, isKnownIcon } from './link-icons';

describe('иконки брендов', () => {
  it('у каждого бренда из списка есть тело SVG', () => {
    for (const name of BRAND_ICON_NAMES) {
      expect(findBrandIcon(name)?.body, name).toMatch(/^<path/);
    }
  });

  it('бренды не из списка неизвестны', () => {
    expect(isKnownIcon('behance')).toBe(true);
    expect(isKnownIcon(GENERIC_ICON)).toBe(true);
    expect(isKnownIcon('font-awesome')).toBe(false);
  });

  it('подбирает иконку по домену', () => {
    expect(detectIcon('www.behance.net')).toBe('behance');
    expect(detectIcon('t.me')).toBe('telegram');
    expect(detectIcon('ok.ru')).toBe('odnoklassniki');
    expect(detectIcon('example.com')).toBe(GENERIC_ICON);
  });
});
