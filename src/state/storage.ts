import { packText, unpackText, type Draft } from './envelope';

export const STORAGE_KEY = 'instacv:draft';

/** Сюда откладываются данные, которые не удалось прочитать, чтобы не затереть их молча. */
export const BACKUP_KEY = 'instacv:draft-backup';

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

/** Ширина колонки редактора, которую человек выбрал разделителем. */
export const PANE_WIDTH_KEY = 'instacv:editor-width';

/** Сохранённая ширина колонки в px или `undefined`, если её нет или значение испорчено. */
export const loadPaneWidth = (): number | undefined => {
  try {
    const width = Number(window.localStorage.getItem(PANE_WIDTH_KEY));
    return Number.isFinite(width) && width > 0 ? width : undefined;
  } catch {
    return undefined;
  }
};

/** Запоминает ширину колонки. Сбой записи не мешает работе: ширина просто не переживёт перезагрузку. */
export const savePaneWidth = (width: number): void => {
  try {
    window.localStorage.setItem(PANE_WIDTH_KEY, String(Math.round(width)));
  } catch {
    // Хранилище недоступно или полно: ширина останется только до перезагрузки.
  }
};
