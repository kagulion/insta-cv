type Plain = Readonly<Record<string, unknown>>;

const isPlainObject = (value: unknown): value is Plain =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Меняет каждый элемент списка `cv[key]`, если это список. Остальное как есть. */
const mapList = (cv: Plain, key: string, map: (item: unknown) => unknown): Plain =>
  Array.isArray(cv[key]) ? { ...cv, [key]: cv[key].map(map) } : cv;

const textItem = (item: unknown): unknown => (typeof item === 'string' ? { text: item } : item);

/**
 * v1 → v2: у полей «строка или объект» остаётся одна форма, удобная для формы редактора.
 * Свои ссылки и пункты списков становятся объектами, год сертификата строкой.
 */
const toV2 = (cv: unknown): unknown => {
  if (!isPlainObject(cv)) return cv;
  let next = cv;
  if (isPlainObject(next.contacts)) {
    const contacts = mapList(next.contacts, 'links', (item) =>
      typeof item === 'string' ? { url: item } : item
    );
    next = { ...next, contacts };
  }
  for (const key of ['achievements', 'publications', 'openSource']) {
    next = mapList(next, key, textItem);
  }
  return mapList(next, 'certificates', (item) =>
    isPlainObject(item) && typeof item.year === 'number'
      ? { ...item, year: String(item.year) }
      : item
  );
};

/** Миграции: ключ это версия, из которой функция переводит данные в следующую. */
export const MIGRATIONS: Readonly<Record<number, (cv: unknown) => unknown>> = {
  1: toV2
};
