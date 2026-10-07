import { describe, expect, it } from 'vitest';
import { pluralRu } from './text';

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
