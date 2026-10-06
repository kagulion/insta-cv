import { describe, expect, it } from 'vitest';
import { BRAND_ICON_NAMES } from './brand-list';
import { findBrandIcon } from './link-icons';

describe('иконки брендов', () => {
  it('у каждого бренда из списка есть тело SVG', () => {
    for (const name of BRAND_ICON_NAMES) {
      expect(findBrandIcon(name)?.body, name).toMatch(/^<path/);
    }
  });

  it('бренд не из списка не найден', () => {
    expect(findBrandIcon('behance')).toBeUndefined();
  });
});
