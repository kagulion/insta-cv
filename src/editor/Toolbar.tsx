import { CircleAlert, Download, Printer, RotateCcw, Trash2, Upload } from 'lucide-preact';
import type { ComponentChildren } from 'preact';
import { useRef } from 'preact/hooks';
import { DEMO_CV } from '../data/demo';
import { previewWindow } from '../preview/printing';
import { draft, EMPTY_CV, notice, replaceDraft, saveStatus, type SaveStatus } from '../state/draft';
import { downloadDraft, readDraftFile } from '../state/files';
import { requestPrint } from './print';

/** Сообщения о сбоях сохранения. Пока всё сохраняется, статус молчит. */
const STATUS_TEXT: Readonly<Record<Exclude<SaveStatus, 'saved'>, string>> = {
  error: 'Не удалось сохранить: в браузере кончилось место',
  unavailable: 'Браузер запрещает сохранение, сделайте экспорт перед уходом'
};

type ButtonProps = {
  readonly onClick: () => void;
  readonly title: string;
  readonly children: ComponentChildren;
};

const ToolButton = ({ onClick, title, children }: ButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    class="pressable inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-2.5 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:border-transparent md:bg-transparent md:text-[13px] md:text-foreground/75 md:hover:bg-foreground/5 md:hover:text-foreground"
  >
    {children}
  </button>
);

const ICON = 'size-4';
/** Появление сообщения: лёгкий сдвиг и проявление. Без этого оно выскакивает рывком. */
const APPEAR =
  'transition-[opacity,translate] duration-200 ease-(--ease-out-strong) motion-safe:starting:translate-y-1 starting:opacity-0';
/** Значки пунктов меню в боковой колонке мельче значков кнопки печати. */
const MENU_ICON = 'size-4 md:size-3.5';

/** Кнопка печати: сохраняет резюме в PDF через диалог печати браузера. */
export const PrintButton = () => (
  <button
    type="button"
    onClick={requestPrint}
    disabled={previewWindow.value === null}
    title="Напечатать или сохранить в PDF (Ctrl+P)"
    class="pressable inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border bg-background px-3 text-sm font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-50 md:px-2.5"
  >
    <Printer class={ICON} aria-hidden="true" />
    Скачать
  </button>
);

/** Действия с черновиком целиком и строка статуса сохранения. */
export const Toolbar = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const status = saveStatus.value;

  const importFile = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    // Сбрасываем выбор, чтобы повторный импорт того же файла снова вызвал `change`.
    input.value = '';
    if (file === undefined) return;
    const result = await readDraftFile(file);
    if (!result.ok) {
      notice.value = `Импорт не удался: ${result.message}.`;
      return;
    }
    if (window.confirm('Заменить текущее резюме данными из файла?')) {
      replaceDraft(result.cv);
      notice.value = undefined;
    }
  };

  const confirmReplace = (question: string, next: typeof EMPTY_CV) => {
    if (window.confirm(question)) {
      replaceDraft(next);
      notice.value = undefined;
    }
  };

  return (
    <div class="space-y-2 md:space-y-4">
      <div class="flex flex-wrap gap-2 md:flex-col md:gap-0.5 [&>button]:md:w-full [&>button]:md:justify-start">
        <ToolButton onClick={() => downloadDraft(draft.value)} title="Скачать резюме JSON-файлом">
          <Download class={MENU_ICON} aria-hidden="true" />
          Экспорт
        </ToolButton>
        <ToolButton onClick={() => fileRef.current?.click()} title="Загрузить резюме из файла">
          <Upload class={MENU_ICON} aria-hidden="true" />
          Импорт
        </ToolButton>
        <ToolButton
          onClick={() => confirmReplace('Заменить текущее резюме демо-примером?', DEMO_CV)}
          title="Открыть демо-резюме"
        >
          <RotateCcw class={MENU_ICON} aria-hidden="true" />
          Демо
        </ToolButton>
        <ToolButton
          onClick={() => confirmReplace('Стереть всё и начать с пустого резюме?', EMPTY_CV)}
          title="Начать с пустого резюме"
        >
          <Trash2 class={MENU_ICON} aria-hidden="true" />
          Очистить
        </ToolButton>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          class="hidden"
          onChange={importFile}
        />
      </div>
      {status !== 'saved' && (
        <p
          role="alert"
          class={`flex items-center gap-1.5 text-xs text-destructive md:px-2 ${APPEAR}`}
        >
          <CircleAlert class="size-3.5 shrink-0" aria-hidden="true" />
          {STATUS_TEXT[status]}
        </p>
      )}
      {notice.value !== undefined && (
        <p
          role="alert"
          class={`rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive ${APPEAR}`}
        >
          {notice.value}
        </p>
      )}
    </div>
  );
};
