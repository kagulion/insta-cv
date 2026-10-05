import { ConfigError, errorMap, toConfigIssues, type ConfigIssue } from './errors';
import { pruneEmpty } from './normalize';
import { cvSchema, type Cv } from './schema';

/** Имя файла конфига в корне проекта, показывается в сообщениях об ошибках. */
export const CONFIG_FILE = 'cv.config.ts';

const CONFIG_GLOB_KEY = '../../cv.config.ts';

// Единственный побочный эффект модуля: Vite подтягивает файл конфига на сборке.
// Через glob, чтобы отсутствие файла стало нашей ошибкой, а не ошибкой Vite.
const configModules = import.meta.glob<{ readonly default?: unknown }>('../../cv.config.ts', {
  eager: true
});

type Validation =
  | { readonly ok: true; readonly cv: Cv }
  | { readonly ok: false; readonly issues: readonly ConfigIssue[] };

/** Чистая проверка: один вход, один результат, входной объект не меняется. */
export const validateConfig = (raw: unknown): Validation => {
  const result = cvSchema.safeParse(raw, { error: errorMap });
  return result.success
    ? { ok: true, cv: pruneEmpty(result.data) }
    : { ok: false, issues: toConfigIssues(result.error.issues) };
};

export const parseConfig = (raw: unknown): Cv => {
  const validation = validateConfig(raw);
  if (!validation.ok) throw new ConfigError(CONFIG_FILE, validation.issues);
  return validation.cv;
};

export const loadConfig = (): Cv => {
  const module = configModules[CONFIG_GLOB_KEY];
  if (module === undefined) {
    throw new ConfigError(CONFIG_FILE, [
      { path: '', message: `файл не найден, создайте ${CONFIG_FILE} в корне проекта` }
    ]);
  }
  if (module.default === undefined) {
    throw new ConfigError(CONFIG_FILE, [
      { path: '', message: 'нет export default, напишите export default defineCV({ ... })' }
    ]);
  }
  return parseConfig(module.default);
};
