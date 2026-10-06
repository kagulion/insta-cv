import {
  CircleAlert,
  CircleCheck,
  Download,
  Printer,
  RotateCcw,
  Trash2,
  Upload
} from 'lucide-preact';
import type { ComponentChildren } from 'preact';
import { useRef } from 'preact/hooks';
import { DEMO_CV } from '../data/demo';
import { previewWindow } from '../preview/printing';
import { draft, EMPTY_CV, notice, replaceDraft, saveStatus, type SaveStatus } from '../state/draft';
import { downloadDraft, readDraftFile } from '../state/files';
import { requestPrint } from './print';

const STATUS_TEXT: Readonly<Record<SaveStatus, string>> = {
  saved: 'Сохранено в этом браузере',
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
    class="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-2.5 text-sm transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:border-transparent md:bg-transparent md:hover:bg-foreground/5"
  >
    {children}
  </button>
);

const ICON = 'size-4';

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
      <div class="flex flex-wrap gap-2 md:flex-col md:gap-0.5 [&>button]:md:w-full [&>button:not(:first-child)]:md:justify-start">
        <button
          type="button"
          onClick={requestPrint}
          disabled={previewWindow.value === null}
          title="Напечатать или сохранить в PDF (Ctrl+P)"
          class="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-50 md:mb-2 md:justify-center"
        >
          <Printer class={ICON} aria-hidden="true" />
          Печать / PDF
        </button>
        <ToolButton onClick={() => downloadDraft(draft.value)} title="Скачать резюме JSON-файлом">
          <Download class={ICON} aria-hidden="true" />
          Экспорт
        </ToolButton>
        <ToolButton onClick={() => fileRef.current?.click()} title="Загрузить резюме из файла">
          <Upload class={ICON} aria-hidden="true" />
          Импорт
        </ToolButton>
        <ToolButton
          onClick={() => confirmReplace('Заменить текущее резюме демо-примером?', DEMO_CV)}
          title="Открыть демо-резюме"
        >
          <RotateCcw class={ICON} aria-hidden="true" />
          Демо
        </ToolButton>
        <ToolButton
          onClick={() => confirmReplace('Стереть всё и начать с пустого резюме?', EMPTY_CV)}
          title="Начать с пустого резюме"
        >
          <Trash2 class={ICON} aria-hidden="true" />
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
      <p
        role="status"
        class={`flex items-center gap-1.5 text-xs md:px-2 ${status === 'saved' ? 'text-muted-foreground' : 'text-destructive'}`}
      >
        {status === 'saved' ? (
          <CircleCheck class="size-3.5" aria-hidden="true" />
        ) : (
          <CircleAlert class="size-3.5" aria-hidden="true" />
        )}
        {STATUS_TEXT[status]}
      </p>
      {notice.value !== undefined && (
        <p role="alert" class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {notice.value}
        </p>
      )}
    </div>
  );
};
