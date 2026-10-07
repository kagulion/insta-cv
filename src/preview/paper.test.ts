import { describe, expect, it } from 'vitest';
import { fitScale, PAPER, sheetHeight } from './paper';

const PAGE_CONTENT = PAPER.height - 2 * PAPER.margin;

describe('высота листа', () => {
  it('короткое резюме занимает один лист', () => {
    expect(sheetHeight(300)).toBe(PAPER.height);
  });

  it('ровно одна страница не превращается в две из-за округления', () => {
    expect(sheetHeight(PAPER.height + 0.5)).toBe(PAPER.height);
  });

  it('длинное резюме округляется до целых страниц', () => {
    expect(sheetHeight(2 * PAPER.margin + 2.5 * PAGE_CONTENT)).toBeCloseTo(
      2 * PAPER.margin + 3 * PAGE_CONTENT
    );
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
