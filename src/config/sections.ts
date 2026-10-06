/**
 * Единственный список секций страницы и их порядок. От него зависят схема,
 * ключи `labels` и тексты по умолчанию: новая секция начинается с правки этого списка.
 */
export const SECTION_ORDER = [
  'about',
  'experience',
  'skills',
  'projects',
  'education',
  'certificates',
  'achievements',
  'publications',
  'openSource',
  'languages',
  'tools',
  'volunteering',
  'interests',
  'recommendations',
  'availability'
] as const;

export type SectionKey = (typeof SECTION_ORDER)[number];

/** Ключи, для которых есть тексты интерфейса: контакты стоят выше списка секций. */
export const SECTION_KEYS = ['contacts', ...SECTION_ORDER] as const;

export type LabelKey = (typeof SECTION_KEYS)[number];

/** Объект с одним значением на каждый ключ из `SECTION_KEYS`. */
export const mapSectionKeys = <V>(build: (key: LabelKey) => V): Record<LabelKey, V> =>
  Object.fromEntries(SECTION_KEYS.map((key) => [key, build(key)])) as Record<LabelKey, V>;

/** Секции, которые можно двигать: «О себе» всегда в шапке, контакты тоже. */
export const MOVABLE_KEYS: readonly SectionKey[] = SECTION_ORDER.filter((key) => key !== 'about');

/** Префикс идентификатора своей секции: по нему она отличается от встроенной. */
export const CUSTOM_PREFIX = 'custom-';

/**
 * Итоговый порядок секций: сохранённый `order` без неизвестных и повторных ключей, а всё,
 * чего в нём нет (новые секции, свои секции), в конце в порядке по умолчанию.
 */
export const resolveOrder = (
  order: readonly string[] | undefined,
  customIds: readonly string[]
): readonly string[] => {
  const known = new Set<string>([...MOVABLE_KEYS, ...customIds]);
  const result: string[] = [];
  for (const key of [...(order ?? []), ...MOVABLE_KEYS, ...customIds]) {
    if (known.has(key) && !result.includes(key)) result.push(key);
  }
  return result;
};
