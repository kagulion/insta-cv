import { errorMap, toConfigIssues, type ConfigIssue } from './errors';
import { pruneEmpty, stripBlankItems } from './normalize';
import { cvSchema, previewSchema, type Cv } from './schema';

export type Validation =
  | { readonly ok: true; readonly cv: Cv }
  | { readonly ok: false; readonly issues: readonly ConfigIssue[] };

/** Строгая проверка: ошибки для формы. Пустые элементы списков ошибкой не считаются. */
export const validateConfig = (raw: unknown): Validation => {
  const result = cvSchema.safeParse(stripBlankItems(raw), { error: errorMap });
  return result.success
    ? { ok: true, cv: pruneEmpty(result.data) }
    : { ok: false, issues: toConfigIssues(result.error.issues) };
};

const isPlainObject = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasKey = (value: unknown, key: PropertyKey | undefined): boolean =>
  (Array.isArray(value) && typeof key === 'number' && key < value.length) ||
  (isPlainObject(value) && typeof key === 'string' && key in value);

/**
 * Убирает значение по пути ошибки. Если глубже по пути ничего нет (поле отсутствует),
 * убирается ближайший существующий узел: элемент списка без обязательного поля пропадает
 * целиком. Ничего не изменилось, значит возвращается тот же объект.
 */
const dropAt = (value: unknown, keys: readonly PropertyKey[]): unknown => {
  const [head, ...rest] = keys;
  if (!hasKey(value, head)) return value;
  const child = (value as Record<PropertyKey, unknown>)[head as PropertyKey];
  const dropChild = rest.length === 0 || !hasKey(child, rest[0]);
  if (Array.isArray(value)) {
    return dropChild
      ? value.filter((_, index) => index !== head)
      : value.map((item, index) => (index === head ? dropAt(item, rest) : item));
  }
  const entries = Object.entries(value as Record<string, unknown>);
  return Object.fromEntries(
    dropChild
      ? entries.filter(([key]) => key !== head)
      : entries.map(([key, item]) => [key, key === head ? dropAt(item, rest) : item])
  );
};

const finishPreview = (data: Cv): Cv => {
  const cv = pruneEmpty(data);
  // Резюме без контактов в мягком режиме допустимо, а пустой объект `pruneEmpty` убирает.
  return { ...cv, contacts: cv.contacts ?? {} };
};

/** Сколько раз превью пробует отбросить неверные значения, прежде чем сдаться. */
const MAX_PRUNE_ROUNDS = 20;

const FALLBACK = finishPreview(
  previewSchema.parse({ name: '', position: '', about: '', contacts: {} })
);

/**
 * Данные для превью из любого черновика, без исключений. Пустые обязательные поля
 * допустимы, а неверные значения (почта, ссылки) отбрасываются, чтобы остальное резюме
 * продолжало рисоваться, пока человек исправляет ошибку в форме.
 */
export const previewConfig = (raw: unknown): Cv => {
  let candidate = stripBlankItems(raw);
  for (let round = 0; round < MAX_PRUNE_ROUNDS; round += 1) {
    const result = previewSchema.safeParse(candidate, { error: errorMap });
    if (result.success) return finishPreview(result.data);
    const next = toConfigIssues(result.error.issues).reduce<unknown>(
      (acc, { keys }) => dropAt(acc, keys),
      candidate
    );
    if (next === candidate) break;
    candidate = next;
  }
  return FALLBACK;
};
