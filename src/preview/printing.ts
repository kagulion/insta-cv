import { signal } from '@preact/signals';

/** Окно iframe превью, когда оно готово к печати. До этого кнопка печати неактивна. */
export const previewWindow = signal<Window | null>(null);

/** Печатает только лист из превью, без редактора. `false`, если превью ещё не готово. */
export const printPreview = (): boolean => {
  const win = previewWindow.peek();
  if (win === null) return false;
  win.focus();
  win.print();
  return true;
};

/**
 * Ctrl+P или Cmd+P: сочетание, которое браузер иначе потратил бы на печать редактора.
 * По `code`, а не `key`: в русской раскладке `key` у этой клавиши «з».
 */
export const isPrintShortcut = (event: KeyboardEvent): boolean =>
  (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.code === 'KeyP';
