import { validateConfig } from './config';
import { DEMO_CV } from './data/demo';
import { PreviewFrame } from './preview/PreviewFrame';
import { Resume } from './preview/Resume';

/** Слева будет форма редактора, справа превью резюме. Пока превью рисует демо-данные. */
export const App = () => {
  const validation = validateConfig(DEMO_CV);

  return (
    <div class="grid h-dvh grid-cols-1 md:grid-cols-[minmax(22rem,1fr)_1.4fr]">
      <aside class="overflow-y-auto border-r bg-secondary/40 p-6">
        <h1 class="text-xl font-medium tracking-tight">Редактор</h1>
        <p class="mt-2 text-sm text-muted-foreground">Формы появятся на шаге 5.</p>
      </aside>
      <main class="min-h-0">
        {validation.ok ? (
          <PreviewFrame lang={validation.cv.lang} documentTitle={validation.cv.name}>
            <Resume cv={validation.cv} year={new Date().getFullYear()} />
          </PreviewFrame>
        ) : (
          <ul class="space-y-1 p-6 text-sm text-destructive">
            {validation.issues.map(({ path, message }) => (
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
