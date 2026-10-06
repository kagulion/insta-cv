import { signal } from '@preact/signals';
import { Printer } from 'lucide-preact';
import { useRef } from 'preact/hooks';
import { Editor } from './editor/Editor';
import { fieldErrors } from './editor/errors';
import { requestPrint } from './editor/print';
import { PrintButton, Toolbar } from './editor/Toolbar';
import { pluralRu } from './lib/text';
import { PreviewFrame } from './preview/PreviewFrame';
import { previewWindow } from './preview/printing';
import { Resume } from './preview/Resume';
import { preview } from './state/draft';
import { loadPaneWidth, savePaneWidth } from './state/storage';

type Tab = 'editor' | 'preview';

/** Какая половина видна на узком экране. С `md` обе видны всегда. */
const tab = signal<Tab>('editor');

/** Ширина колонки редактора на компьютере, px. Её двигает разделитель. */
const editorWidth = signal(loadPaneWidth() ?? 420);
const MIN_EDITOR = 360;
/** Колонка редактора не шире половины карточки: остальное отдано превью. */
const MAX_EDITOR_SHARE = 0.5;
const KEY_STEP = 24;

const TABS: readonly { readonly id: Tab; readonly label: string }[] = [
  { id: 'editor', label: 'Редактор' },
  { id: 'preview', label: 'Превью' }
];

/** Переключатель «Редактор | Превью» для телефона: две колонки там не помещаются. */
const MobileTabs = () => {
  /** Стрелки, Home и End переключают вкладки и переносят на них фокус. */
  const onKeyDown = (event: KeyboardEvent) => {
    const shift = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    const last = TABS.length - 1;
    const current = TABS.findIndex(({ id }) => id === tab.value);
    const next =
      shift !== undefined
        ? (current + shift + TABS.length) % TABS.length
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? last
            : undefined;
    const target = next === undefined ? undefined : TABS[next];
    if (target === undefined) return;
    event.preventDefault();
    tab.value = target.id;
    document.getElementById(`tab-${target.id}`)?.focus();
  };

  return (
    <nav class="flex items-center gap-2 bg-secondary px-3 py-2 md:hidden">
      <div role="tablist" onKeyDown={onKeyDown} class="flex flex-1 rounded-lg bg-border/60 p-0.5">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            id={`tab-${id}`}
            role="tab"
            tabIndex={tab.value === id ? 0 : -1}
            aria-selected={tab.value === id}
            aria-controls={`pane-${id}`}
            onClick={() => (tab.value = id)}
            class="h-8 flex-1 rounded-md text-sm transition-colors aria-selected:bg-background aria-selected:font-medium aria-selected:shadow-sm"
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={requestPrint}
        disabled={previewWindow.value === null}
        aria-label="Скачать PDF"
        title="Скачать PDF"
        class="inline-flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
      >
        <Printer class="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
};

/** Разделитель колонок: тянется мышью или пальцем, двигается стрелками. */
const Resizer = ({
  container
}: {
  readonly container: { readonly current: HTMLElement | null };
}) => {
  const move = (width: number) => {
    const max = Math.max(MIN_EDITOR, (container.current?.clientWidth ?? 0) * MAX_EDITOR_SHARE);
    editorWidth.value = Math.min(max, Math.max(MIN_EDITOR, width));
  };

  const onPointerDown = (event: PointerEvent) => {
    const handle = event.currentTarget as HTMLElement;
    const left = container.current?.getBoundingClientRect().left ?? 0;
    handle.setPointerCapture(event.pointerId);
    const onMove = (e: PointerEvent) => move(e.clientX - left);
    const stop = () => {
      savePaneWidth(editorWidth.value);
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', stop);
      handle.removeEventListener('pointercancel', stop);
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const shift = { ArrowLeft: -KEY_STEP, ArrowRight: KEY_STEP }[event.key];
    if (shift === undefined) return;
    event.preventDefault();
    move(editorWidth.value + shift);
    savePaneWidth(editorWidth.value);
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Ширина редактора"
      aria-valuenow={Math.round(editorWidth.value)}
      aria-valuemin={MIN_EDITOR}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      class="group relative hidden w-px shrink-0 cursor-col-resize touch-none bg-border/50 outline-none md:block"
    >
      {/* Широкая зона захвата вокруг тонкой линии. */}
      <span class="absolute inset-y-0 -right-1.5 -left-1.5 transition-colors group-hover:bg-foreground/5 group-focus-visible:bg-foreground/10 group-active:bg-foreground/10" />
    </div>
  );
};

/** Слева редактор, справа превью резюме из того же черновика. На телефоне вкладки. */
export const App = () => {
  const cv = preview.value;
  const issues = fieldErrors.value.size;
  const shown = (id: Tab) => (tab.value === id ? '' : 'max-md:hidden');
  const panes = useRef<HTMLDivElement>(null);

  return (
    <div class="flex h-dvh flex-col bg-secondary md:flex-row">
      <MobileTabs />
      <header
        class={`space-y-3 px-4 pt-4 pb-3 md:w-40 md:shrink-0 md:overflow-y-auto md:px-3 ${shown('editor')} md:flex md:flex-col`}
      >
        <h1 class="md:px-[11px]">
          <img
            src={`${import.meta.env.BASE_URL}logotype.svg`}
            alt="Insta CV"
            width="56"
            height="24"
            class="h-6 w-auto"
          />
        </h1>
        {issues > 0 && (
          <p class="text-xs text-muted-foreground tabular-nums md:px-[11px]">
            {issues} {pluralRu(issues, ['поле', 'поля', 'полей'])} заполнить или исправить
          </p>
        )}
        <Toolbar />
        <div>
          <PrintButton />
        </div>
        <p class="mt-auto hidden pt-3 text-xs text-muted-foreground md:block md:px-[11px]">
          {new Date().getFullYear()}
        </p>
      </header>
      <div
        ref={panes}
        class="flex min-h-0 flex-1 overflow-hidden bg-background md:m-3 md:ml-0 md:rounded-xl md:border md:shadow-sm"
      >
        <aside
          id="pane-editor"
          style={{ '--editor-width': `${editorWidth.value}px` }}
          class={`min-h-0 min-w-0 flex-1 overflow-y-auto md:w-(--editor-width) md:max-w-1/2 md:min-w-90 md:flex-none ${shown('editor')}`}
        >
          <Editor />
        </aside>
        <Resizer container={panes} />
        <main id="pane-preview" class={`min-h-0 min-w-0 flex-1 ${shown('preview')}`}>
          <PreviewFrame
            lang={cv.lang}
            documentTitle={cv.name || 'Резюме'}
            onPrintShortcut={requestPrint}
          >
            <Resume cv={cv} />
          </PreviewFrame>
        </main>
      </div>
    </div>
  );
};
