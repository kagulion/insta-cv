import { z } from 'zod';
import { capitalize, pluralRu } from '../lib/text';

export type ConfigIssue = {
  /** Путь поля, например `experience[1].company`. Пустой для проблемы всего резюме. */
  readonly path: string;
  /** Тот же путь по шагам: `['experience', 1, 'company']`. */
  readonly keys: readonly PropertyKey[];
  /** Текст для человека: с заглавной буквы, как отдельная фраза под полем. */
  readonly message: string;
};

export const formatPath = (path: readonly PropertyKey[]): string =>
  path.reduce<string>((acc, segment) => {
    if (typeof segment === 'number') return `${acc}[${segment}]`;
    const name = String(segment);
    return acc === '' ? name : `${acc}.${name}`;
  }, '');

type ZodIssue = z.core.$ZodIssue;

/**
 * Для `string | объект` Zod отдаёт одну общую ошибку. Берём ветку, чей тип
 * совпал со вводом, она содержит настоящую причину. Совпавшей ветки нет
 * (например, пришёл `true`), тогда остаётся общее сообщение union.
 */
const pickUnionBranch = (
  branches: readonly (readonly ZodIssue[])[]
): readonly ZodIssue[] | undefined =>
  branches.find((issues) => !issues.some((i) => i.code === 'invalid_type' && i.path.length === 0));

export const toConfigIssues = (
  issues: readonly ZodIssue[],
  base: readonly PropertyKey[] = []
): readonly ConfigIssue[] =>
  issues.flatMap((issue): readonly ConfigIssue[] => {
    const path = [...base, ...issue.path];
    if (issue.code === 'unrecognized_keys') {
      // схема отдаёт по строке сообщения на ключ, в том же порядке, что и `keys`
      const lines = issue.message.split('\n');
      return issue.keys.map((key, i) => ({
        path: formatPath([...path, key]),
        keys: [...path, key],
        message: capitalize(lines[i] ?? 'неизвестный ключ')
      }));
    }
    if (issue.code === 'invalid_union') {
      const branch = pickUnionBranch(issue.errors);
      if (branch !== undefined) return toConfigIssues(branch, path);
    }
    return [{ path: formatPath(path), keys: path, message: capitalize(issue.message) }];
  });

const { localeError } = z.locales.ru();

const TYPE_NAMES: Readonly<Record<string, string>> = {
  string: 'строка',
  number: 'число',
  boolean: 'true или false',
  object: 'объект',
  array: 'список'
};

const describeValue = (value: unknown): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return TYPE_NAMES.array ?? 'список';
  return TYPE_NAMES[typeof value] ?? typeof value;
};

/**
 * Русская локаль Zod с правками: пропущенное поле это просто «обязательное поле»,
 * в неверном типе названия типов тоже по-русски, а слишком длинный текст описан
 * словами, без «string» и «<=».
 */
export const errorMap: z.core.$ZodErrorMap = (issue) => {
  if (issue.code === 'too_big' && issue.origin === 'string') {
    const max = Number(issue.maximum);
    return `слишком длинный текст: не больше ${max} ${pluralRu(max, ['символа', 'символов', 'символов'])}`;
  }
  if (issue.code === 'invalid_type') {
    if (issue.input === undefined) return 'обязательное поле';
    const expected = TYPE_NAMES[issue.expected];
    if (expected !== undefined) {
      return `неверный тип: ожидалось «${expected}», получено «${describeValue(issue.input)}»`;
    }
  }
  return localeError(issue);
};
