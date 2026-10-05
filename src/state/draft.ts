import { computed, effect, signal } from '@preact/signals';
import { previewConfig, validateConfig } from '../config';
import { DEMO_CV } from '../data/demo';
import { unpackText, type Draft } from './envelope';
import { loadDraft, saveDraft, STORAGE_KEY } from './storage';

/** Пустое резюме для кнопки «Очистить»: обязательные поля есть, но не заполнены. */
export const EMPTY_CV: Draft = { name: '', position: '', about: '', contacts: {} };

/**
 * Состояние сохранения для строки статуса:
 * `saved` записано, `error` запись не удалась, `unavailable` хранилища нет вовсе.
 */
export type SaveStatus = 'saved' | 'error' | 'unavailable';

export const draft = signal<Draft>(DEMO_CV);

/** Строгая проверка на каждую правку: из неё форма берёт ошибки под полями. */
export const validation = computed(() => validateConfig(draft.value));

/** Данные превью: рисуются всегда, даже из незаполненного или частично неверного черновика. */
export const preview = computed(() => previewConfig(draft.value));

export const saveStatus = signal<SaveStatus>('saved');

/** Сообщение над формой: повреждённые данные при загрузке, ошибка импорта. */
export const notice = signal<string | undefined>(undefined);

export const replaceDraft = (cv: Draft): void => {
  draft.value = cv;
};

/** Правка черновика: функция получает текущий и возвращает новый, вход не меняется. */
export const updateDraft = (update: (cv: Draft) => Draft): void => {
  draft.value = update(draft.peek());
};

/**
 * Первая загрузка: черновик из хранилища или демо. Повреждённые данные не теряются,
 * их копия лежит в резервном ключе, а пользователь видит предупреждение.
 */
export const hydrateDraft = (storage: Storage | undefined): void => {
  if (storage === undefined) {
    saveStatus.value = 'unavailable';
    return;
  }
  const loaded = loadDraft(storage);
  if (loaded.kind === 'ok') draft.value = loaded.cv;
  if (loaded.kind === 'broken') {
    notice.value = `Сохранённое резюме не удалось прочитать (${loaded.message}), открыто демо.`;
  }
};

/**
 * Автосохранение: правка пишется в хранилище через `delay` мс после последнего изменения
 * и сразу при уходе со страницы. Правки из другой вкладки подхватываются через `storage`.
 * Возвращает функцию остановки.
 */
export const startAutosave = (storage: Storage | undefined, delay = 300): (() => void) => {
  if (storage === undefined) return () => undefined;

  let timer: ReturnType<typeof setTimeout> | undefined;
  const flush = () => {
    if (timer === undefined) return;
    clearTimeout(timer);
    timer = undefined;
    saveStatus.value = saveDraft(storage, draft.peek()) ? 'saved' : 'error';
  };

  let initial = true;
  const stopEffect = effect(() => {
    // Подписка на черновик. Первый запуск это загрузка, сохранять нечего.
    void draft.value;
    if (initial) {
      initial = false;
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(flush, delay);
  });

  // Повторная запись того же значения не порождает `storage`, поэтому вкладки не зацикливаются.
  const onStorage = (event: StorageEvent) => {
    if (event.storageArea !== storage || event.key !== STORAGE_KEY || event.newValue === null) {
      return;
    }
    const result = unpackText(event.newValue);
    if (result.ok) draft.value = result.cv;
  };

  window.addEventListener('pagehide', flush);
  window.addEventListener('storage', onStorage);
  return () => {
    flush();
    stopEffect();
    window.removeEventListener('pagehide', flush);
    window.removeEventListener('storage', onStorage);
  };
};
