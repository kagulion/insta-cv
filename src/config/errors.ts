import { z } from 'astro/zod';

export type ConfigIssue = {
  /** Путь поля, например `experience[1].company`. Пустой для проблемы всего файла. */
  readonly path: string;
  readonly message: string;
};

const ROOT_PATH_LABEL = '(весь файл)';

export const formatPath = (path: readonly PropertyKey[]): string =>
  path.reduce<string>((acc, segment) => {
    if (typeof segment === 'number') return `${acc}[${segment}]`;
    const name = String(segment);
    return acc === '' ? name : `${acc}.${name}`;
  }, '');

const pluralizeErrors = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return `найдено ${count} ошибок`;
  if (lastDigit === 1) return `найдена ${count} ошибка`;
  if (lastDigit >= 2 && lastDigit <= 4) return `найдено ${count} ошибки`;
  return `найдено ${count} ошибок`;
};

export const formatConfigError = (file: string, issues: readonly ConfigIssue[]): string =>
  [
    `${file}: ${pluralizeErrors(issues.length)}`,
    ...issues.map(({ path, message }) => `  ${path === '' ? ROOT_PATH_LABEL : path}: ${message}`)
  ].join('\n');

/** Ошибка конфига: понятный список проблем с путями полей, ошибка на сборке. */
export class ConfigError extends Error {
  readonly file: string;
  readonly issues: readonly ConfigIssue[];

  constructor(file: string, issues: readonly ConfigIssue[]) {
    super(formatConfigError(file, issues));
    this.name = 'ConfigError';
    this.file = file;
    this.issues = issues;
  }
}

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
        message: lines[i] ?? 'неизвестный ключ'
      }));
    }
    if (issue.code === 'invalid_union') {
      const branch = pickUnionBranch(issue.errors);
      if (branch !== undefined) return toConfigIssues(branch, path);
    }
    return [{ path: formatPath(path), message: issue.message }];
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
 * Русская локаль Zod с двумя правками: пропущенное поле это просто «обязательное поле»,
 * а в неверном типе названия типов тоже по русски.
 */
export const errorMap: z.core.$ZodErrorMap = (issue) => {
  if (issue.code === 'invalid_type') {
    if (issue.input === undefined) return 'обязательное поле';
    const expected = TYPE_NAMES[issue.expected];
    if (expected !== undefined) {
      return `неверный тип: ожидалось «${expected}», получено «${describeValue(issue.input)}»`;
    }
  }
  return localeError(issue);
};
