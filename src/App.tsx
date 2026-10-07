import { signal } from '@preact/signals';
import { useRef } from 'preact/hooks';
import { Editor } from './editor/Editor';
import { fieldErrors } from './editor/errors';
import { requestPrint } from './editor/print';
import { PrintButton, Toolbar } from './editor/Toolbar';
import { pluralRu } from './lib/text';
import { PreviewFrame } from './preview/PreviewFrame';
import { Resume } from './preview/Resume';
import { preview } from './state/draft';
import { loadPaneWidth, savePaneWidth } from './state/storage';

type Tab = 'editor' | 'preview';

/** Какая половина видна на узком экране. С `lg` обе видны всегда. */
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

/** Наибольшая ширина колонки редактора при текущем размере карточки, px. */
const maxEditor = (container: { readonly current: HTMLElement | null }): number =>
  Math.max(MIN_EDITOR, (container.current?.clientWidth ?? 0) * MAX_EDITOR_SHARE);

/** Переключатель «Редактор | Превью» для телефона и планшета: две колонки там не помещаются. */
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
    <nav class="flex items-center gap-2 bg-secondary px-3 py-2 max-md:order-first md:pt-3 md:pl-0 lg:hidden">
      <div
        role="tablist"
        onKeyDown={onKeyDown}
        class="flex flex-1 rounded-lg bg-foreground/10 p-0.5"
      >
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
            class="pressable h-8 flex-1 rounded-md text-sm aria-selected:bg-background aria-selected:font-medium aria-selected:shadow-sm"
          >
            {label}
          </button>
        ))}
      </div>
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
    editorWidth.value = Math.min(maxEditor(container), Math.max(MIN_EDITOR, width));
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
      aria-valuemax={Math.round(maxEditor(container))}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      class="group relative hidden w-px shrink-0 cursor-col-resize touch-none bg-border/50 outline-none lg:block"
    >
      {/* Широкая зона захвата вокруг тонкой линии. */}
      <span class="absolute inset-y-0 -right-1.5 -left-1.5 transition-colors group-hover:bg-foreground/5 group-focus-visible:bg-foreground/40 group-active:bg-foreground/10" />
    </div>
  );
};

/** Слева редактор, справа превью резюме из того же черновика. На телефоне и планшете вкладки. */
export const App = () => {
  const cv = preview.value;
  const issues = fieldErrors.value.size;
  const shown = (id: Tab) => (tab.value === id ? '' : 'max-lg:hidden');
  // Превью не прячем через display: у скрытого листа нет размеров, и масштаб с высотой
  // считались бы по нулям. Невидимое, но выложенное, оно измеряется верно и при показе.
  const previewShown =
    tab.value === 'preview' ? '' : 'max-lg:invisible max-lg:absolute max-lg:inset-0';
  const panes = useRef<HTMLDivElement>(null);

  return (
    <div class="flex h-dvh flex-col bg-secondary md:flex-row">
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
        {/* Область всегда в DOM: скринридер объявляет изменения только в уже существующей. */}
        <div role="status" class="empty:hidden">
          {issues > 0 && (
            <p class="text-xs text-muted-foreground tabular-nums md:px-[11px]">
              {issues} {pluralRu(issues, ['поле', 'поля', 'полей'])} заполнить или исправить
            </p>
          )}
        </div>
        <Toolbar />
        <div class="max-md:hidden">
          <PrintButton />
        </div>
        <p class="mt-auto hidden pt-3 text-xs text-muted-foreground md:block md:px-[11px]">
          {new Date().getFullYear()}
        </p>
      </header>
      <div class="flex min-h-0 min-w-0 flex-1 flex-col max-md:contents">
        <MobileTabs />
        <main
          ref={panes}
          class="relative flex min-h-0 flex-1 overflow-hidden bg-background md:m-3 md:mt-2 md:ml-0 md:rounded-xl md:border md:shadow-sm lg:mt-3"
        >
          <div
            id="pane-editor"
            role="tabpanel"
            aria-labelledby="tab-editor"
            style={{ '--editor-width': `${editorWidth.value}px` }}
            class={`min-h-0 min-w-0 flex-1 overflow-y-auto lg:w-(--editor-width) lg:max-w-1/2 lg:min-w-90 lg:flex-none ${shown('editor')}`}
          >
            <Editor />
          </div>
          <Resizer container={panes} />
          <div
            id="pane-preview"
            role="tabpanel"
            aria-labelledby="tab-preview"
            class={`min-h-0 min-w-0 flex-1 ${previewShown}`}
          >
            <PreviewFrame
              lang={cv.lang}
              documentTitle={cv.name || 'Резюме'}
              onPrintShortcut={requestPrint}
            >
              <Resume cv={cv} />
            </PreviewFrame>
          </div>
        </main>
      </div>
    </div>
  );
};
