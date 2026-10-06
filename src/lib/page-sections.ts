import type { Cv, ResolvedLabels, SectionKey } from '../config';
import { DEFAULT_CUSTOM_TITLE } from '../config/defaults';
import { resolveOrder } from '../config/sections';

export type SectionEntry<C> = {
  /** Ключ встроенной секции или идентификатор своей. */
  readonly key: string;
  readonly id: string;
  readonly title: string;
  /** Компонент встроенной секции. У своей секции его нет, вместо него `text`. */
  readonly component?: C;
  readonly text?: string;
};

/** Якорь блока контактов в шапке. */
export const CONTACTS_ID = 'contacts';

/** Якорь секции: ключ в kebab case (`openSource` даёт `open-source`). */
export const anchorId = (key: string): string =>
  key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * Секции страницы в порядке `cv.order`: только те, для которых в `Cv` есть данные
 * и в реестре есть компонент. Единственное место правила «нет данных, нет секции».
 */
export const buildSections = <C>(
  cv: Cv,
  labels: ResolvedLabels,
  registry: Readonly<Record<SectionKey, C | null>>
): readonly SectionEntry<C>[] => {
  const custom = cv.customSections ?? [];
  const order = resolveOrder(
    cv.order,
    custom.map(({ id }) => id)
  );
  return order.flatMap((key): SectionEntry<C>[] => {
    const own = custom.find(({ id }) => id === key);
    if (own !== undefined) {
      if (own.text === undefined) return [];
      return [{ key, id: anchorId(key), title: own.title ?? DEFAULT_CUSTOM_TITLE, text: own.text }];
    }
    const component = registry[key as SectionKey];
    if (cv[key as SectionKey] === undefined || component === null) return [];
    return [{ key, id: anchorId(key), title: labels.sections[key as SectionKey], component }];
  });
};

/**
 * Абзацы текста: пустая строка делит абзацы, одиночный перенос делит строки внутри абзаца.
 * Строки пустыми не бывают, абзацы без строк отбрасываются.
 */
export const splitParagraphs = (text: string): readonly (readonly string[])[] =>
  text
    .replace(/\r\n?/g, '\n')
    .split(/\n[ \t]*\n/)
    .map((block) =>
      block
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '')
    )
    .filter((lines) => lines.length > 0);
