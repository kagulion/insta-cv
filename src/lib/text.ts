/** Склеивает заполненные части через разделитель. Пустые и `undefined` пропускаются, если частей нет, вернёт `''`. */
export const joinFilled = (parts: readonly (string | undefined)[], separator: string): string =>
  parts.filter((part) => part !== undefined && part !== '').join(separator);

/** Русское множественное число: `pluralRu(3, ['поле', 'поля', 'полей'])` → «поля». */
export const pluralRu = (
  count: number,
  [one, few, many]: readonly [string, string, string]
): string => {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 19) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
};
