import type { Cv, ResolvedLabels, SectionKey } from '../config';
import { SECTION_ORDER } from '../config/sections';

export type SectionEntry<C> = {
  readonly key: SectionKey;
  readonly id: string;
  readonly title: string;
  readonly component: C;
};

/** Якорь блока контактов в шапке. */
export const CONTACTS_ID = 'contacts';

/** Якорь секции: ключ в kebab case (`openSource` даёт `open-source`). */
export const anchorId = (key: SectionKey): string =>
  key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/**
 * Секции страницы в порядке `SECTION_ORDER`: только те, для которых в `Cv` есть данные
 * и в реестре есть компонент. Единственное место правила «нет данных, нет секции».
 */
export const buildSections = <C>(
  cv: Cv,
  labels: ResolvedLabels,
  registry: Readonly<Record<SectionKey, C | null>>
): readonly SectionEntry<C>[] =>
  SECTION_ORDER.flatMap((key) => {
    const component = registry[key];
    if (cv[key] === undefined || component === null) return [];
    return [{ key, id: anchorId(key), title: labels.sections[key], component }];
  });

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
