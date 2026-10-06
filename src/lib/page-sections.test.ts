import { describe, expect, it } from 'vitest';
import { splitParagraphs } from './page-sections';

describe('splitParagraphs', () => {
  it('пустая строка делит абзацы, перенос делит строки', () => {
    expect(splitParagraphs('Раз\nДва\n\nТри')).toEqual([['Раз', 'Два'], ['Три']]);
  });

  it('понимает переносы Windows и пустую строку с пробелами', () => {
    expect(splitParagraphs('Раз\r\n \t\r\nДва')).toEqual([['Раз'], ['Два']]);
  });

  it('пустой текст не даёт абзацев', () => {
    expect(splitParagraphs(' \n\n  ')).toEqual([]);
  });
});
