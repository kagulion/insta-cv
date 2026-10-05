import { computed, signal } from '@preact/signals';
import { validation } from '../state/draft';

/** Ошибки строгой проверки по пути поля: `experience[0].company` → «обязательное поле». */
export const fieldErrors = computed(
  (): ReadonlyMap<string, string> =>
    new Map(validation.value.ok ? [] : validation.value.issues.map((i) => [i.path, i.message]))
);

/** Поля, из которых уже уходил фокус: пустое обязательное поле ругается только после этого. */
const touched = signal<ReadonlySet<string>>(new Set());

export const touch = (path: string): void => {
  if (!touched.peek().has(path)) touched.value = new Set([...touched.peek(), path]);
};

/**
 * Ошибка поля, если её пора показать: в поле что-то написано или его уже трогали.
 * Так свежая форма не краснеет целиком, а опечатка в почте видна сразу.
 */
export const visibleError = (path: string, filled: boolean): string | undefined => {
  const error = fieldErrors.value.get(path);
  return error !== undefined && (filled || touched.value.has(path)) ? error : undefined;
};

/** Сколько ошибок внутри секции: для счётчика в её заголовке. */
export const countErrors = (prefix: string): number =>
  [...fieldErrors.value.keys()].filter(
    (path) => path === prefix || path.startsWith(`${prefix}.`) || path.startsWith(`${prefix}[`)
  ).length;
