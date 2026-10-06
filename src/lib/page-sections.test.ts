import { describe, expect, it } from 'vitest';
import { previewConfig, resolveLabels, resolveOrder } from '../config';
import { buildSections, splitParagraphs } from './page-sections';

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

describe('порядок секций', () => {
  it('resolveOrder дописывает недостающие и отбрасывает лишние ключи', () => {
    const order = resolveOrder(['skills', 'nope', 'skills', 'custom-a'], ['custom-a', 'custom-b']);
    expect(order.slice(0, 2)).toEqual(['skills', 'custom-a']);
    expect(order).toContain('experience');
    expect(order).toContain('custom-b');
    expect(order).not.toContain('nope');
    expect(order).not.toContain('about');
    expect(new Set(order).size).toBe(order.length);
  });

  it('buildSections идёт в заданном порядке и рисует свою секцию', () => {
    const cv = previewConfig({
      name: 'A',
      position: 'B',
      about: 'C',
      contacts: {},
      skills: ['TS'],
      tools: ['Git'],
      order: ['tools', 'custom-x', 'skills'],
      customSections: [
        { id: 'custom-x', title: 'Хобби', text: 'Шахматы' },
        { id: 'custom-empty', title: 'Пусто', text: '' }
      ]
    });
    const registry = { skills: 1, tools: 2 } as never;
    const result = buildSections(cv, resolveLabels(cv), registry);
    expect(result.map(({ key }) => key)).toEqual(['tools', 'custom-x', 'skills']);
    expect(result[1]).toMatchObject({ title: 'Хобби', text: 'Шахматы' });
  });
});
