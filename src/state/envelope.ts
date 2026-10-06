import type { CvInput } from '../config';
import { MIGRATIONS } from './migrations';

/**
 * Черновик резюме: то, что ввёл пользователь, до проверки схемой. Может быть невалидным,
 * пока человек печатает, поэтому хранится и сохраняется как есть.
 */
export type Draft = CvInput;

/** Метка формата: по ней импорт отличает наш файл от любого другого JSON. */
export const APP_ID = 'instacv';

/** Версия формата черновика. Меняется вместе со схемой, старые данные догоняет `MIGRATIONS`. */
export const DRAFT_VERSION = 4;

/** Конверт черновика: одинаковый в localStorage и в файле экспорта. */
export type Envelope = {
  readonly app: typeof APP_ID;
  readonly version: number;
  readonly cv: Draft;
};

export type Unpacked =
  { readonly ok: true; readonly cv: Draft } | { readonly ok: false; readonly message: string };

const isPlainObject = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const fail = (message: string): Unpacked => ({ ok: false, message });

export const pack = (cv: Draft): Envelope => ({ app: APP_ID, version: DRAFT_VERSION, cv });

/**
 * Достаёт черновик из конверта и догоняет его до текущей версии. Схемой не проверяет:
 * невалидный черновик это нормальное состояние, ошибки покажет редактор.
 */
export const unpack = (raw: unknown): Unpacked => {
  if (!isPlainObject(raw) || raw.app !== APP_ID) return fail('это не файл резюме Insta CV');
  const { version } = raw;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    return fail('в файле нет версии формата');
  }
  if (version > DRAFT_VERSION) {
    return fail('файл сохранён более новой версией редактора, обновите страницу');
  }
  let cv: unknown = raw.cv;
  for (let from = version; from < DRAFT_VERSION; from += 1) {
    const migrate = MIGRATIONS[from];
    if (migrate === undefined) return fail(`нет миграции с версии ${from}`);
    cv = migrate(cv);
  }
  return isPlainObject(cv) ? { ok: true, cv: cv as Draft } : fail('в файле нет данных резюме');
};

/** То же, что `unpack`, но из текста: файл или значение из localStorage. */
export const unpackText = (text: string): Unpacked => {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return fail('файл повреждён: это не JSON');
  }
  return unpack(raw);
};

export const packText = (cv: Draft): string => JSON.stringify(pack(cv), null, 2);
