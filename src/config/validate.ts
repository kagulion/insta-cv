import { errorMap, toConfigIssues, type ConfigIssue } from './errors';
import { pruneEmpty } from './normalize';
import { cvSchema, type Cv } from './schema';

export type Validation =
  | { readonly ok: true; readonly cv: Cv }
  | { readonly ok: false; readonly issues: readonly ConfigIssue[] };

/** Чистая проверка: один вход, один результат, входной объект не меняется. */
export const validateConfig = (raw: unknown): Validation => {
  const result = cvSchema.safeParse(raw, { error: errorMap });
  return result.success
    ? { ok: true, cv: pruneEmpty(result.data) }
    : { ok: false, issues: toConfigIssues(result.error.issues) };
};
