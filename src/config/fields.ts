import { z } from 'zod';
import { suggestKey } from './suggest';

/**
 * Режим проверки. `strict` для ошибок в форме: обязательные поля должны быть заполнены.
 * `lenient` для превью: пустое обязательное поле допустимо, превью рисует то, что есть.
 */
export type Mode = 'strict' | 'lenient';

/** Пределы длины: строка в одну-две строки на экране и многоабзацный текст. */
export const MAX_LINE = 600;
export const MAX_PARAGRAPHS = 3000;

/** Любая строка обрезается по краям. */
export const text = z.string().trim().max(MAX_LINE);

/** Текст в несколько абзацев: «О себе», цитата, увлечения. */
export const longText = z.string().trim().max(MAX_PARAGRAPHS);

const emptyAsMissing = (value: string): string | undefined => (value === '' ? undefined : value);

/** Необязательная строка: пустая после обрезки становится `undefined`, то есть «поля нет». */
export const optionalText = text.transform(emptyAsMissing).optional();
export const optionalLongText = longText.transform(emptyAsMissing).optional();

const REQUIRED = 'обязательное поле';

/** Обязательная строка. В мягком режиме может остаться пустой, но всегда строка. */
export const requiredText = (mode: Mode) => (mode === 'strict' ? text.min(1, REQUIRED) : text);
export const requiredLongText = (mode: Mode) =>
  mode === 'strict' ? longText.min(1, REQUIRED) : longText;

/** Строка, обязательная в обоих режимах: без неё элемент не имеет смысла (адрес ссылки). */
export const required = text.min(1, REQUIRED);

/** Пункт списка строк. Пустые пункты убирает `stripBlankItems` ещё до проверки. */
export const filled = text.min(1, 'не может быть пустым');

export const stringList = z.array(filled).optional();

/** Необязательный список элементов. Пустой список потом считается «секции нет». */
export const list = <T extends z.ZodType>(item: T) => z.array(item).optional();

/** Необязательная внешняя ссылка: только http и https, пустая строка значит «нет ссылки». */
export const optionalUrl = text
  .transform(emptyAsMissing)
  .pipe(
    z
      .url({ protocol: /^https?$/, error: 'ожидалась ссылка, начинающаяся с http:// или https://' })
      .optional()
  )
  .optional();

const unknownKeyMessage = (key: string, known: readonly string[]): string => {
  const suggestion = suggestKey(key, known);
  return suggestion === undefined
    ? 'неизвестный ключ'
    : `неизвестный ключ, возможно, имелось в виду ${suggestion}`;
};

/**
 * Объект, где лишний ключ это ошибка. Сообщение содержит по строке на каждый
 * лишний ключ, `toConfigIssues` разносит их по путям.
 */
export const strictObject = <T extends z.core.$ZodShape>(shape: T) => {
  const known = Object.keys(shape);
  return z.strictObject(shape, {
    error: (issue) =>
      issue.code === 'unrecognized_keys'
        ? issue.keys.map((key) => unknownKeyMessage(key, known)).join('\n')
        : undefined
  });
};
