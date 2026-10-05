import { packText, unpackText, type Draft } from './envelope';

export const STORAGE_KEY = 'prostocv:draft';

/** Сюда откладываются данные, которые не удалось прочитать, чтобы не затереть их молча. */
export const BACKUP_KEY = 'prostocv:draft-backup';

/**
 * localStorage или `undefined`, если он недоступен: в приватном режиме или при запрете
 * данных сайтов даже обращение к `window.localStorage` бросает исключение.
 */
export const getStorage = (): Storage | undefined => {
  try {
    const storage = window.localStorage;
    const probe = `${STORAGE_KEY}:probe`;
    storage.setItem(probe, probe);
    storage.removeItem(probe);
    return storage;
  } catch {
    return undefined;
  }
};

export type Loaded =
  | { readonly kind: 'empty' }
  | { readonly kind: 'ok'; readonly cv: Draft }
  | { readonly kind: 'broken'; readonly message: string };

/** Черновик из хранилища. Нечитаемое значение уходит в `BACKUP_KEY`. */
export const loadDraft = (storage: Storage): Loaded => {
  let text: string | null;
  try {
    text = storage.getItem(STORAGE_KEY);
  } catch {
    return { kind: 'empty' };
  }
  if (text === null) return { kind: 'empty' };
  const result = unpackText(text);
  if (result.ok) return { kind: 'ok', cv: result.cv };
  try {
    storage.setItem(BACKUP_KEY, text);
  } catch {
    // Резервная копия не влезла: остаётся исходное значение, пока его не перезапишет правка.
  }
  return { kind: 'broken', message: result.message };
};

/** Сохраняет черновик. `false`, если запись не удалась (например, кончилось место). */
export const saveDraft = (storage: Storage, cv: Draft): boolean => {
  try {
    storage.setItem(STORAGE_KEY, packText(cv));
    return true;
  } catch {
    return false;
  }
};
