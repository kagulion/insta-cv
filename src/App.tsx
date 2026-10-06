import { Editor } from './editor/Editor';
import { fieldErrors } from './editor/errors';
import { requestPrint } from './editor/print';
import { Toolbar } from './editor/Toolbar';
import { pluralRu } from './lib/text';
import { PreviewFrame } from './preview/PreviewFrame';
import { Resume } from './preview/Resume';
import { preview } from './state/draft';

/** Слева редактор, справа превью резюме из того же черновика. */
export const App = () => {
  const cv = preview.value;
  const issues = fieldErrors.value.size;

  return (
    <div class="grid h-dvh grid-cols-1 md:grid-cols-[minmax(24rem,1fr)_1.3fr]">
      <aside class="flex min-h-0 flex-col border-r bg-secondary/40">
        <header class="space-y-3 border-b bg-secondary/60 px-5 pt-4 pb-3 backdrop-blur">
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
        <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <Editor />
        </div>
      </aside>
      <main class="min-h-0 min-w-0">
        <PreviewFrame
          lang={cv.lang}
          documentTitle={cv.name || 'Резюме'}
          onPrintShortcut={requestPrint}
        >
          <Resume cv={cv} />
        </PreviewFrame>
      </main>
    </div>
  );
};
