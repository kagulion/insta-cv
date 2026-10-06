import { ChevronRight } from 'lucide-preact';
import type { ComponentChildren } from 'preact';
import { loadOpenSections, saveOpenSections } from '../state/storage';
import { countErrors } from './errors';

/** Раскрытые секции с прошлого раза. Читаются один раз: дальше состояние ведёт сам `<details>`. */
const SAVED_OPEN = loadOpenSections();

/** Сохраняет, какие секции раскрыты сейчас. */
const rememberOpen = () =>
  saveOpenSections(
    [...document.querySelectorAll<HTMLElement>('details[data-section][open]')].map(
      (element) => element.dataset.section ?? ''
    )
  );

type Props = {
  /** Постоянный идентификатор секции для сохранения: заголовок зависит от языка резюме. */
  readonly id: string;
  readonly title: string;
  /** Пути ошибок, которые считаются в счётчике заголовка: `experience`, `contacts`. */
  readonly errorPaths: readonly string[];
  readonly defaultOpen?: boolean;
  readonly children: ComponentChildren;
};

/**
 * Секция формы: раскрывающийся блок. Состояние раскрытия живёт в DOM: `open` задан только
 * при первом рендере, дальше Preact его не трогает, потому что значение пропса не меняется.
 */
export const EditorSection = ({ id, title, errorPaths, defaultOpen, children }: Props) => {
  const errors = errorPaths.reduce((sum, path) => sum + countErrors(path), 0);
  return (
    <details
      data-section={id}
      open={SAVED_OPEN === undefined ? defaultOpen : SAVED_OPEN.includes(id)}
      onToggle={rememberOpen}
      class="group border-b border-border/50 bg-background"
    >
      <summary class="flex cursor-pointer list-none items-center gap-2 px-5 py-3 select-none hover:bg-accent/60 [&::-webkit-details-marker]:hidden">
        <ChevronRight
          class="size-4 text-muted-foreground transition-transform group-open:rotate-90"
          aria-hidden="true"
        />
        <span class="flex-1 text-sm font-medium">{title}</span>
        {errors > 0 && (
          <span
            class="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive tabular-nums"
            title="Поля, которые нужно заполнить или исправить"
          >
            {errors}
          </span>
        )}
      </summary>
      <div class="space-y-4 px-5 pt-1 pb-5">{children}</div>
    </details>
  );
};
