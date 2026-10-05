import { packText, unpackText, type Draft, type Unpacked } from './envelope';

/** Символы, которые запрещены в именах файлов в Windows и macOS, и управляющие символы. */
const FORBIDDEN = /[\\/:*?"<>|\p{Cc}]+/gu;

/** Имя файла экспорта из имени человека: «Алексей Кузнецов.json», без имени «resume.json». */
export const exportFileName = (name: string | undefined): string => {
  const base = (name ?? '').replace(FORBIDDEN, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  return `${base === '' ? 'resume' : base}.json`;
};

/** Скачивает черновик JSON-файлом. Ссылки на резюме при этом не появляется: файл остаётся у человека. */
export const downloadDraft = (cv: Draft): void => {
  const blob = new Blob([packText(cv)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = exportFileName(cv.name);
  link.click();
  // Даём браузеру начать загрузку, потом освобождаем память.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

/** Предел размера импорта: резюме весит килобайты, мегабайт это точно чужой файл. */
const MAX_IMPORT_BYTES = 1024 * 1024;

export const readDraftFile = async (file: File): Promise<Unpacked> => {
  if (file.size > MAX_IMPORT_BYTES) return { ok: false, message: 'файл слишком большой' };
  return unpackText(await file.text());
};
