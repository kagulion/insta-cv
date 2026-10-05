const isPlainObject = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const prune = (value: unknown): unknown => {
  if (typeof value === 'string') return value === '' ? undefined : value;
  if (Array.isArray(value)) {
    const items = value.map(prune).filter((item) => item !== undefined);
    return items.length === 0 ? undefined : items;
  }
  if (isPlainObject(value)) {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, prune(item)] as const)
      .filter(([, item]) => item !== undefined);
    return entries.length === 0 ? undefined : Object.fromEntries(entries);
  }
  return value;
};

/**
 * Убирает «пустое»: строки без текста, пустые списки и объекты, ключи со значением
 * `undefined`. Запускается после проверки схемы, строки к этому моменту уже обрезаны,
 * а обязательные поля проверены, поэтому пустеть могут только необязательные.
 * Вход не меняется. Тип сохраняется: схема допускает отсутствие всего, что тут пропадает.
 */
export const pruneEmpty = <T extends object>(value: T): T => (prune(value) ?? {}) as T;
