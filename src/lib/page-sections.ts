import type { Cv, ResolvedLabels, SectionKey } from '../config';
import { SECTION_ORDER } from '../config/sections';

export type SectionEntry<C> = {
  readonly key: SectionKey;
  readonly id: string;
  readonly title: string;
  readonly nav: string;
  readonly component: C;
};

/** Якорь блока контактов в шапке, на него ведёт меню. */
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
    const { title, nav } = labels.sections[key];
    return [{ key, id: anchorId(key), title, nav, component }];
  });

/** Абзацы текста: пустая строка делит, одиночный перенос становится пробелом. */
export const splitParagraphs = (text: string): readonly string[] =>
  text
    .replace(/\r\n?/g, '\n')
    .split(/\n[ \t]*\n/)
    .map((block) => block.replace(/\s*\n\s*/g, ' ').trim())
    .filter((block) => block !== '');
