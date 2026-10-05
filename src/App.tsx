import { validateConfig } from './config';
import { DEMO_CV } from './data/demo';

/**
 * Каркас: слева будет форма, справа превью. Пока превью показывает, что демо-данные
 * проходят ту же схему, что и раньше, но уже в браузере.
 */
export const App = () => {
  const validation = validateConfig(DEMO_CV);

  return (
    <div class="grid h-dvh grid-cols-1 md:grid-cols-[minmax(22rem,1fr)_1.4fr]">
      <aside class="overflow-y-auto border-r bg-secondary/40 p-6">
        <h1 class="text-xl font-medium tracking-tight">Редактор</h1>
        <p class="mt-2 text-sm text-muted-foreground">Формы появятся на шаге 5.</p>
      </aside>
      <main class="overflow-y-auto p-6">
        {validation.ok ? (
          <div>
            <p class="text-2xl font-medium tracking-tight">{validation.cv.name}</p>
            <p class="text-muted-foreground">{validation.cv.position}</p>
            <p class="mt-4 text-sm text-muted-foreground">Превью появится на шаге 3.</p>
          </div>
        ) : (
          <ul class="space-y-1 text-sm text-destructive">
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
