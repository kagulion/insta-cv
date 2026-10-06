import { signal } from '@preact/signals';
import { Printer } from 'lucide-preact';
import { Editor } from './editor/Editor';
import { fieldErrors } from './editor/errors';
import { requestPrint } from './editor/print';
import { Toolbar } from './editor/Toolbar';
import { pluralRu } from './lib/text';
import { PreviewFrame } from './preview/PreviewFrame';
import { previewWindow } from './preview/printing';
import { Resume } from './preview/Resume';
import { preview } from './state/draft';

type Tab = 'editor' | 'preview';

/** Какая половина видна на узком экране. С `md` обе видны всегда. */
const tab = signal<Tab>('editor');

const TABS: readonly { readonly id: Tab; readonly label: string }[] = [
  { id: 'editor', label: 'Редактор' },
  { id: 'preview', label: 'Превью' }
];

/** Переключатель «Редактор | Превью» для телефона: две колонки там не помещаются. */
const MobileTabs = () => (
  <nav class="flex items-center gap-2 border-b bg-secondary/60 px-3 py-2 md:hidden">
    <div role="tablist" class="flex flex-1 rounded-lg bg-border/60 p-0.5">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
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
      aria-label="Печать / PDF"
      title="Печать / PDF"
      class="inline-flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
    >
      <Printer class="size-4" aria-hidden="true" />
    </button>
  </nav>
);

/** Слева редактор, справа превью резюме из того же черновика. На телефоне вкладки. */
export const App = () => {
  const cv = preview.value;
  const issues = fieldErrors.value.size;
  const shown = (id: Tab) => (tab.value === id ? '' : 'max-md:hidden');

  return (
    <div class="flex h-dvh flex-col">
      <MobileTabs />
      <div class="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(24rem,1fr)_1.3fr]">
        <aside
          id="pane-editor"
          class={`flex min-h-0 flex-col bg-secondary/40 md:border-r ${shown('editor')}`}
        >
          <header class="space-y-3 border-b bg-secondary/60 px-4 pt-4 pb-3 md:px-5">
            <div class="flex items-baseline justify-between gap-3">
              <h1 class="text-lg font-medium tracking-tight">Редактор резюме</h1>
              {issues > 0 && (
                <p class="text-xs text-muted-foreground tabular-nums">
                  {issues} {pluralRu(issues, ['поле', 'поля', 'полей'])} заполнить или исправить
                </p>
              )}
            </div>
            <Toolbar />
          </header>
          <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5">
            <Editor />
          </div>
        </aside>
        <main id="pane-preview" class={`min-h-0 min-w-0 ${shown('preview')}`}>
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
