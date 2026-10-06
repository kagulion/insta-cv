import { describe, expect, it } from 'vitest';
import { pluralRu } from '../lib/text';
import { fitScale, paginate, PAPER } from './paper';

const PAGE_CONTENT = PAPER.height - 2 * PAPER.margin;

describe('разбивка на страницы', () => {
  it('короткое резюме занимает один лист', () => {
    expect(paginate(300)).toEqual({ pages: 1, height: PAPER.height });
  });

  it('ровно одна страница не превращается в две из-за округления', () => {
    expect(paginate(PAPER.height + 0.5).pages).toBe(1);
  });

  it('длинное резюме разбивается на целые страницы', () => {
    const result = paginate(2 * PAPER.margin + 2.5 * PAGE_CONTENT);
    expect(result.pages).toBe(3);
    expect(result.height).toBeCloseTo(2 * PAPER.margin + 3 * PAGE_CONTENT);
  });
});

describe('масштаб листа', () => {
  it('не увеличивает лист на широком экране', () => {
    expect(fitScale(2000)).toBe(1);
  });

  it('уменьшает лист под узкую панель', () => {
    expect(fitScale(PAPER.width / 2)).toBeCloseTo(0.5);
  });

  it('до первого замера оставляет масштаб 1', () => {
    expect(fitScale(0)).toBe(1);
  });
});

describe('pluralRu', () => {
  const forms = ['поле', 'поля', 'полей'] as const;

  it.each([
    [1, 'поле'],
    [3, 'поля'],
    [5, 'полей'],
    [11, 'полей'],
    [21, 'поле'],
    [104, 'поля']
  ])('%i → %s', (count, expected) => {
    expect(pluralRu(count, forms)).toBe(expected);
  });
});
