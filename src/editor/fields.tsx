import { X } from 'lucide-preact';
import type { ComponentChildren } from 'preact';
import { useId, useState } from 'preact/hooks';
import { touch, visibleError } from './errors';

const CONTROL =
  'w-full rounded-md border bg-background px-3 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive';

type FieldProps = {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly hint?: string;
  readonly error?: string;
  readonly children: ComponentChildren;
};

/** Подпись, поле, подсказка и ошибка. Ошибка связана с полем через `aria-describedby`. */
const Field = ({ id, label, required, hint, error, children }: FieldProps) => (
  <div class="space-y-1.5">
    <label for={id} class="block text-[13px] font-medium">
      {label}
      {required === true && (
        <span class="text-muted-foreground" aria-hidden="true">
          {' '}
          *
        </span>
      )}
    </label>
    {children}
    {error !== undefined ? (
      <p id={`${id}-message`} class="text-xs text-destructive">
        {error}
      </p>
    ) : (
      hint !== undefined && (
        <p id={`${id}-message`} class="text-xs text-muted-foreground">
          {hint}
        </p>
      )
    )}
  </div>
);

type TextProps = {
  readonly label: string;
  /** Путь поля в черновике: по нему ищется ошибка проверки. */
  readonly path: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly hint?: string;
  readonly required?: boolean;
  readonly type?: 'text' | 'email' | 'tel' | 'url';
};

export const TextField = ({
  label,
  path,
  value,
  onChange,
  placeholder,
  hint,
  required,
  type
}: TextProps) => {
  const id = useId();
  const error = visibleError(path, value.trim() !== '');
  return (
    <Field id={id} label={label} required={required} hint={hint} error={error}>
      <input
        id={id}
        // Типы Preact для `<input>` не принимают объединение значений `type`, только литерал.
        type={(type ?? 'text') as 'text'}
        value={value}
        placeholder={placeholder}
        onInput={(event) => onChange(event.currentTarget.value)}
        onBlur={() => touch(path)}
        aria-invalid={error !== undefined}
        aria-describedby={error !== undefined || hint !== undefined ? `${id}-message` : undefined}
        class={`${CONTROL} h-9`}
      />
    </Field>
  );
};

type AreaProps = Omit<TextProps, 'type'> & { readonly rows?: number };

/** Многострочный текст. Высота растёт по содержимому там, где есть `field-sizing`. */
export const TextArea = ({
  label,
  path,
  value,
  onChange,
  placeholder,
  hint,
  required,
  rows
}: AreaProps) => {
  const id = useId();
  const error = visibleError(path, value.trim() !== '');
  return (
    <Field id={id} label={label} required={required} hint={hint} error={error}>
      <textarea
        id={id}
        value={value}
        rows={rows ?? 3}
        placeholder={placeholder}
        onInput={(event) => onChange(event.currentTarget.value)}
        onBlur={() => touch(path)}
        aria-invalid={error !== undefined}
        aria-describedby={error !== undefined || hint !== undefined ? `${id}-message` : undefined}
        class={`${CONTROL} field-sizing-content min-h-20 py-2 leading-relaxed`}
      />
    </Field>
  );
};

type ListProps = {
  readonly label: string;
  readonly value: readonly string[];
  readonly onChange: (value: string[]) => void;
  readonly placeholder?: string;
  readonly hint?: string;
};

/**
 * Список строк как текст «по одному на строку». Пустые строки остаются в черновике,
 * чтобы Enter в конце не съедался, а при проверке они просто не считаются.
 */
export const LinesField = ({ label, value, onChange, placeholder, hint }: ListProps) => {
  const id = useId();
  return (
    <Field id={id} label={label} hint={hint}>
      <textarea
        id={id}
        value={value.join('\n')}
        rows={3}
        placeholder={placeholder}
        onInput={(event) => onChange(event.currentTarget.value.split('\n'))}
        aria-describedby={hint !== undefined ? `${id}-message` : undefined}
        class={`${CONTROL} field-sizing-content min-h-20 py-2 leading-relaxed`}
      />
    </Field>
  );
};

/** Теги: Enter или запятая добавляют, Backspace в пустом поле убирает последний. */
export const TagsField = ({ label, value, onChange, placeholder, hint }: ListProps) => {
  const id = useId();
  const [pending, setPending] = useState('');
  const tags = value.filter((tag) => tag.trim() !== '');

  const commit = (raw: string) => {
    const added = raw
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');
    if (added.length > 0) onChange([...tags, ...added]);
    setPending('');
  };

  return (
    <Field id={id} label={label} hint={hint ?? 'Enter или запятая добавляют тег'}>
      <div
        class={`${CONTROL} flex min-h-9 flex-wrap items-center gap-1.5 px-1.5 py-1.5 focus-within:border-foreground/40 focus-within:ring-2 focus-within:ring-ring/40`}
      >
        {tags.map((tag, index) => (
          <span
            key={index}
            class="inline-flex max-w-full items-center gap-0.5 rounded-md bg-secondary py-0.5 pr-0.5 pl-2 text-xs"
          >
            <span class="min-w-0 wrap-anywhere">{tag}</span>
            <button
              type="button"
              onClick={() => onChange(tags.filter((_, i) => i !== index))}
              aria-label={`Убрать «${tag}»`}
              class="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X class="size-3" aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={pending}
          placeholder={tags.length === 0 ? placeholder : undefined}
          onInput={(event) => {
            const next = event.currentTarget.value;
            if (next.includes(',')) commit(next);
            else setPending(next);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commit(pending);
            } else if (event.key === 'Backspace' && pending === '' && tags.length > 0) {
              onChange(tags.slice(0, -1));
            }
          }}
          onBlur={() => commit(pending)}
          aria-describedby={`${id}-message`}
          class="h-6 min-w-24 flex-1 bg-transparent px-1.5 text-sm outline-none placeholder:text-muted-foreground/70"
        />
      </div>
    </Field>
  );
};

type SelectProps = {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: readonly { readonly value: string; readonly label: string }[];
};

export const SelectField = ({ label, value, onChange, options }: SelectProps) => {
  const id = useId();
  return (
    <Field id={id} label={label}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        class={`${CONTROL} h-9`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
};

type CheckboxProps = {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
};

export const CheckboxField = ({ label, checked, onChange }: CheckboxProps) => (
  <label class="flex items-center gap-2 text-sm">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.currentTarget.checked)}
      class="size-4 accent-foreground"
    />
    {label}
  </label>
);
