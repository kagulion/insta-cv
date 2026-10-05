import { Toolbar } from './editor/Toolbar';
import { PreviewFrame } from './preview/PreviewFrame';
import { Resume } from './preview/Resume';
import { validation } from './state/draft';

/** Слева редактор, справа превью резюме из того же черновика. */
export const App = () => {
  const result = validation.value;

  return (
    <div class="grid h-dvh grid-cols-1 md:grid-cols-[minmax(22rem,1fr)_1.4fr]">
      <aside class="space-y-6 overflow-y-auto border-r bg-secondary/40 p-6">
        <h1 class="text-xl font-medium tracking-tight">Редактор</h1>
        <Toolbar />
        <p class="text-sm text-muted-foreground">Формы появятся на шаге 5.</p>
      </aside>
      <main class="min-h-0">
        {result.ok ? (
          <PreviewFrame lang={result.cv.lang} documentTitle={result.cv.name}>
            <Resume cv={result.cv} year={new Date().getFullYear()} />
          </PreviewFrame>
        ) : (
          <ul class="space-y-1 p-6 text-sm text-destructive">
            {result.issues.map(({ path, message }) => (
              <li key={path}>
                {path}: {message}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};
