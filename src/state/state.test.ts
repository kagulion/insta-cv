import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO_CV } from '../data/demo';
import { draft, EMPTY_CV, hydrateDraft, notice, saveStatus, startAutosave } from './draft';
import { APP_ID, DRAFT_VERSION, pack, packText, unpack, unpackText } from './envelope';
import { exportFileName } from './files';
import { BACKUP_KEY, loadDraft, saveDraft, STORAGE_KEY } from './storage';

/** localStorage в памяти. `quota` задаёт, сколько символов влезает, как настоящий предел. */
class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>();
  constructor(private readonly quota = Infinity) {}
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    if (value.length > this.quota) throw new DOMException('quota', 'QuotaExceededError');
    this.data.set(key, value);
  }
}

describe('конверт черновика', () => {
  it('упаковывает и распаковывает без потерь', () => {
    expect(unpack(pack(DEMO_CV))).toEqual({ ok: true, cv: DEMO_CV });
    expect(unpackText(packText(EMPTY_CV))).toEqual({ ok: true, cv: EMPTY_CV });
  });

  it('не проверяет схему: невалидный черновик сохраняется как есть', () => {
    const cv = { name: '', contacts: {} };
    expect(unpack({ app: APP_ID, version: DRAFT_VERSION, cv })).toEqual({ ok: true, cv });
  });

  it('отклоняет чужие и битые файлы', () => {
    expect(unpackText('не json').ok).toBe(false);
    expect(unpack({ name: 'Иван' }).ok).toBe(false);
    expect(unpack({ app: APP_ID, cv: {} }).ok).toBe(false);
    expect(unpack({ app: APP_ID, version: DRAFT_VERSION, cv: [] }).ok).toBe(false);
  });

  it('отклоняет файл из более новой версии', () => {
    const result = unpack({ app: APP_ID, version: DRAFT_VERSION + 1, cv: {} });
    expect(result).toEqual({
      ok: false,
      message: 'файл сохранён более новой версией редактора, обновите страницу'
    });
  });
});

describe('хранилище', () => {
  it('пустое хранилище', () => {
    expect(loadDraft(new MemoryStorage())).toEqual({ kind: 'empty' });
  });

  it('сохраняет и загружает черновик', () => {
    const storage = new MemoryStorage();
    expect(saveDraft(storage, DEMO_CV)).toBe(true);
    expect(loadDraft(storage)).toEqual({ kind: 'ok', cv: DEMO_CV });
  });

  it('откладывает нечитаемые данные в резервный ключ', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, '{oops');
    expect(loadDraft(storage).kind).toBe('broken');
    expect(storage.getItem(BACKUP_KEY)).toBe('{oops');
  });

  it('сообщает о нехватке места', () => {
    expect(saveDraft(new MemoryStorage(10), DEMO_CV)).toBe(false);
  });
});

describe('имя файла экспорта', () => {
  it('берёт имя человека и убирает запрещённые символы', () => {
    expect(exportFileName('Алексей Кузнецов')).toBe('Алексей Кузнецов.json');
    expect(exportFileName('A/B: "C"')).toBe('A B C.json');
    expect(exportFileName('  ')).toBe('resume.json');
    expect(exportFileName(undefined)).toBe('resume.json');
  });
});

describe('загрузка и автосохранение', () => {
  let stop: () => void = () => undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('window', new EventTarget());
    draft.value = DEMO_CV;
    saveStatus.value = 'saved';
    notice.value = undefined;
  });

  afterEach(() => {
    stop();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('подхватывает сохранённый черновик', () => {
    const storage = new MemoryStorage();
    saveDraft(storage, EMPTY_CV);
    hydrateDraft(storage);
    expect(draft.value).toEqual(EMPTY_CV);
  });

  it('без хранилища остаётся демо и статус «недоступно»', () => {
    hydrateDraft(undefined);
    expect(draft.value).toBe(DEMO_CV);
    expect(saveStatus.value).toBe('unavailable');
  });

  it('при битых данных открывает демо и предупреждает', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, 'null');
    hydrateDraft(storage);
    expect(draft.value).toBe(DEMO_CV);
    expect(notice.value).toMatch(/не удалось прочитать/);
  });

  it('пишет одну запись после серии правок', () => {
    const storage = new MemoryStorage();
    const setItem = vi.spyOn(storage, 'setItem');
    stop = startAutosave(storage, 300);
    expect(setItem).not.toHaveBeenCalled();

    draft.value = { ...EMPTY_CV, name: 'И' };
    vi.advanceTimersByTime(200);
    draft.value = { ...EMPTY_CV, name: 'Иван' };
    vi.advanceTimersByTime(299);
    expect(setItem).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(loadDraft(storage)).toEqual({ kind: 'ok', cv: { ...EMPTY_CV, name: 'Иван' } });
  });

  it('при уходе со страницы сохраняет сразу', () => {
    const storage = new MemoryStorage();
    stop = startAutosave(storage, 300);
    draft.value = EMPTY_CV;
    window.dispatchEvent(new Event('pagehide'));
    expect(loadDraft(storage)).toEqual({ kind: 'ok', cv: EMPTY_CV });
  });

  it('показывает ошибку, если запись не удалась', () => {
    stop = startAutosave(new MemoryStorage(10), 300);
    draft.value = EMPTY_CV;
    vi.advanceTimersByTime(300);
    expect(saveStatus.value).toBe('error');
  });
});
