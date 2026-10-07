import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-preact';
import type { ComponentChildren } from 'preact';
import { loadOpenSections, saveOpenSections } from '../state/storage';
import { countErrors } from './errors';
import { TextField } from './fields';

/** Раскрытые секции с прошлого раза. Читаются один раз: дальше состояние ведёт сам `<details>`. */
const SAVED_OPEN = loadOpenSections();

/** Сохраняет, какие секции раскрыты сейчас. */
const rememberOpen = () =>
  saveOpenSections(
    [...document.querySelectorAll<HTMLElement>('details[data-section][open]')].map(
      (element) => element.dataset.section ?? ''
    )
  );

/** Название секции на листе: пустое значение возвращает название по умолчанию. */
type Rename = {
  readonly value: string;
  readonly placeholder: string;
  readonly path: string;
  readonly onChange: (value: string) => void;
};

/** Перемещение секции на листе: `null` значит «двигать некуда». */
type Move = {
  readonly up: (() => void) | null;
  readonly down: (() => void) | null;
};

type Props = {
  /** Постоянный идентификатор секции для сохранения: заголовок зависит от языка резюме. */
  readonly id: string;
  readonly title: string;
  /** Пути ошибок, которые считаются в счётчике заголовка: `experience`, `contacts`. */
  readonly errorPaths: readonly string[];
  readonly defaultOpen?: boolean;
  readonly rename?: Rename;
  readonly move?: Move;
  /** Кнопка удаления в конце секции: есть только у своих секций. */
  readonly onRemove?: () => void;
  readonly children: ComponentChildren;
};

/**
 * Секция формы: раскрывающийся блок. Состояние раскрытия живёт в DOM: `open` задан только
 * при первом рендере, дальше Preact его не трогает, потому что значение пропса не меняется.
 */
export const EditorSection = ({
  id,
  title,
  errorPaths,
  defaultOpen,
  rename,
  move,
  onRemove,
  children
}: Props) => {
  const errors = errorPaths.reduce((sum, path) => sum + countErrors(path), 0);
  return (
    <div class="relative">
      <details
        data-section={id}
        open={SAVED_OPEN === undefined ? defaultOpen : SAVED_OPEN.includes(id)}
        onToggle={rememberOpen}
        class="group border-b border-border/50 bg-background"
      >
        <summary
          class={`flex cursor-pointer list-none items-center gap-2 py-3 pl-5 select-none hover:bg-accent/60 [&::-webkit-details-marker]:hidden ${move === undefined ? 'pr-5' : 'pr-24'}`}
        >
          <ChevronRight
            class="size-4 text-muted-foreground group-open:rotate-90 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-(--ease-out-strong)"
            aria-hidden="true"
          />
          <h2 class="flex-1 text-sm font-medium">{title}</h2>
          {errors > 0 && (
            <span
              class="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive tabular-nums"
              title="Поля, которые нужно заполнить или исправить"
            >
              {errors}
            </span>
          )}
        </summary>
        <div class="space-y-4 px-5 pt-1 pb-5">
          {rename !== undefined && (
            <TextField
              label="Название секции"
              path={rename.path}
              value={rename.value}
              placeholder={rename.placeholder}
              onChange={rename.onChange}
            />
          )}
          {children}
          {onRemove !== undefined && (
            <button
              type="button"
              onClick={onRemove}
              class="text-xs text-destructive hover:underline"
            >
              Удалить секцию
            </button>
          )}
        </div>
      </details>
      {move !== undefined && (
        <span class="absolute top-0 right-5 flex h-11 items-center">
          <MoveButton label={`Поднять секцию «${title}» выше`} action={move.up}>
            <ChevronUp class="size-4" aria-hidden="true" />
          </MoveButton>
          <MoveButton label={`Опустить секцию «${title}» ниже`} action={move.down}>
            <ChevronDown class="size-4" aria-hidden="true" />
          </MoveButton>
        </span>
      )}
    </div>
  );
};

type MoveButtonProps = {
  readonly label: string;
  readonly action: (() => void) | null;
  readonly children: ComponentChildren;
};

/** Кнопка поверх строки заголовка. Вне `<summary>`: вложенные в него кнопки недоступны скринридерам. */
const MoveButton = ({ label, action, children }: MoveButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={action === null}
    onClick={() => action?.()}
    class="pressable rounded p-1.5 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
  >
    {children}
  </button>
);
