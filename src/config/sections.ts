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
