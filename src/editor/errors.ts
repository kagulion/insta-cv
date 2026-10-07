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

/** Показать ошибки сразу у всех полей: например, когда человек пытается напечатать резюме. */
export const touchAll = (paths: Iterable<string>): void => {
  touched.value = new Set([...touched.peek(), ...paths]);
};

/**
 * Ошибка поля, если её пора показать: в поле что-то написано или его уже трогали.
 * Так свежая форма не краснеет целиком, а опечатка в почте видна сразу.
 */
export const visibleError = (path: string, filled: boolean): string | undefined => {
  const error = fieldErrors.value.get(path);
  return error !== undefined && (filled || touched.value.has(path)) ? error : undefined;
};

/** Путь внутри `prefix`: он сам, его поле или элемент его списка. */
const isWithin = (path: string, prefix: string): boolean =>
  path === prefix || path.startsWith(`${prefix}.`) || path.startsWith(`${prefix}[`);

/** Сколько ошибок внутри путей `include`, кроме лежащих в `exclude`: для счётчика в заголовке секции. */
export const countErrors = (include: readonly string[], exclude: readonly string[] = []): number =>
  [...fieldErrors.value.keys()].filter(
    (path) =>
      include.some((prefix) => isWithin(path, prefix)) &&
      !exclude.some((prefix) => isWithin(path, prefix))
  ).length;

/**
 * Первая ошибка списка строк: у самого списка или у любого пункта. Пустые пункты ошибкой
 * не считаются, поэтому ошибку не прячем до ухода фокуса, как у обычных полей.
 */
export const listError = (path: string): string | undefined =>
  [...fieldErrors.value].find(([key]) => isWithin(key, path))?.[1];
