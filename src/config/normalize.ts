const isPlainObject = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** «Пустое» значение: строка из пробелов или объект, где все поля такие же пустые. */
const isBlank = (value: unknown): boolean => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.every(isBlank);
  if (isPlainObject(value)) return Object.values(value).every(isBlank);
  return false;
};

const strip = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.filter((item) => !isBlank(item)).map(strip);
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, strip(item)]));
  }
  return value;
};

/**
 * Убирает пустые элементы списков до проверки: новая незаполненная должность или пустая
 * строка в буллетах это не ошибка, а «ещё ничего нет». Вход не меняется, тип сохраняется.
 */
export const stripBlankItems = <T>(value: T): T => strip(value) as T;

const prune = (value: unknown): unknown => {
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
 * Убирает пустые списки и объекты без полей, а также ключи со значением `undefined`.
 * Строки не трогает: пустые необязательные поля схема уже превратила в `undefined`,
 * а пустое обязательное поле в мягком режиме должно остаться строкой.
 */
export const pruneEmpty = <T extends object>(value: T): T => (prune(value) ?? {}) as T;
