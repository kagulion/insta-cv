import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-preact';
import { LinesField, SelectField, TagsField, TextArea, TextField } from './fields';

/** Ключи объекта со строковым значением. */
type StringKey<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends string ? K : never;
}[keyof T] &
  string;

/** Ключи объекта со списком строк. */
type ListKey<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends readonly string[] ? K : never;
}[keyof T] &
  string;

type Common = {
  readonly label: string;
  readonly placeholder?: string;
  readonly hint?: string;
};

/** Описание поля элемента списка: из таких описаний собирается форма любой секции-списка. */
export type FieldSpec<T> =
  | (Common & {
      readonly kind: 'text' | 'url' | 'textarea';
      readonly key: StringKey<T>;
      readonly required?: boolean;
      /** Поле в половину ширины: два таких встают в строку. */
      readonly half?: boolean;
    })
  | (Common & { readonly kind: 'lines' | 'tags'; readonly key: ListKey<T> })
  | (Common & {
      readonly kind: 'select';
      readonly key: StringKey<T>;
      readonly options: readonly { readonly value: string; readonly label: string }[];
      readonly half?: boolean;
    });

type FieldsProps<T> = {
  readonly item: T;
  readonly path: string;
  readonly fields: readonly FieldSpec<T>[];
  readonly onChange: (item: T) => void;
};

/** Форма одного элемента по описаниям полей. */
export const ItemFields = <T,>({ item, path, fields, onChange }: FieldsProps<T>) => {
  const values = item as Readonly<Record<string, unknown>>;
  const set = (key: string, value: unknown) => onChange({ ...values, [key]: value } as T);

  return (
    <div class="grid grid-cols-2 gap-3">
      {fields.map((spec) => {
        const fieldPath = `${path}.${spec.key}`;
        if (spec.kind === 'lines' || spec.kind === 'tags') {
          const value = (values[spec.key] as readonly string[] | undefined) ?? [];
          const Component = spec.kind === 'lines' ? LinesField : TagsField;
          return (
            <div key={spec.key} class="col-span-2">
              <Component
                label={spec.label}
                value={value}
                placeholder={spec.placeholder}
                hint={spec.hint}
                onChange={(next) => set(spec.key, next)}
              />
            </div>
          );
        }
        const value = (values[spec.key] as string | undefined) ?? '';
        const width =
          'half' in spec && spec.half === true ? 'col-span-2 sm:col-span-1' : 'col-span-2';
        if (spec.kind === 'select') {
          return (
            <div key={spec.key} class={width}>
              <SelectField
                label={spec.label}
                value={value}
                options={spec.options}
                onChange={(next) => set(spec.key, next)}
              />
            </div>
          );
        }
        const props = {
          label: spec.label,
          path: fieldPath,
          value,
          placeholder: spec.placeholder,
          hint: spec.hint,
          required: 'required' in spec ? spec.required : undefined,
          onChange: (next: string) => set(spec.key, next)
        };
        return (
          <div key={spec.key} class={width}>
            {spec.kind === 'textarea' ? (
              <TextArea {...props} />
            ) : (
              <TextField {...props} type={spec.kind === 'url' ? 'url' : 'text'} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const isBlank = (item: object): boolean =>
  Object.values(item).every((value) =>
    Array.isArray(value)
      ? value.every((line) => String(line).trim() === '')
      : String(value ?? '').trim() === ''
  );

type ListProps<T> = {
  readonly items: readonly T[];
  readonly onChange: (items: T[]) => void;
  /** Путь списка в черновике, например `experience` или `contacts.links`. */
  readonly path: string;
  readonly fields: readonly FieldSpec<T>[];
  readonly create: () => T;
  /** Заголовок карточки элемента: обычно его главное поле. */
  readonly title: (item: T) => string | undefined;
  readonly addLabel: string;
};

const ICON_BUTTON =
  'rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30';

/** Список элементов с добавлением, удалением и перестановкой. */
export const ListEditor = <T,>({
  items,
  onChange,
  path,
  fields,
  create,
  title,
  addLabel
}: ListProps<T>) => {
  const replace = (index: number, item: T) =>
    onChange(items.map((current, i) => (i === index ? item : current)));

  const move = (index: number, shift: -1 | 1) => {
    const next = [...items];
    const [moved] = next.splice(index, 1);
    if (moved === undefined) return;
    next.splice(index + shift, 0, moved);
    onChange(next);
  };

  const remove = (index: number, item: T) => {
    const name = title(item)?.trim() || 'эту запись';
    if (isBlank(item as object) || window.confirm(`Удалить «${name}»?`)) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  return (
    <div class="space-y-3">
      {items.map((item, index) => (
        <div key={index} class="rounded-lg border bg-background p-3">
          <div class="mb-3 flex items-center gap-1">
            <p class="min-w-0 flex-1 truncate text-sm font-medium">
              {title(item)?.trim() || <span class="text-muted-foreground">Новая запись</span>}
            </p>
            <button
              type="button"
              class={ICON_BUTTON}
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label="Выше"
              title="Выше"
            >
              <ChevronUp class="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              class={ICON_BUTTON}
              onClick={() => move(index, 1)}
              disabled={index === items.length - 1}
              aria-label="Ниже"
              title="Ниже"
            >
              <ChevronDown class="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              class={`${ICON_BUTTON} hover:text-destructive`}
              onClick={() => remove(index, item)}
              aria-label="Удалить"
              title="Удалить"
            >
              <Trash2 class="size-4" aria-hidden="true" />
            </button>
          </div>
          <ItemFields
            item={item}
            path={`${path}[${index}]`}
            fields={fields}
            onChange={(next) => replace(index, next)}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, create()])}
        class="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-background hover:text-foreground"
      >
        <Plus class="size-4" aria-hidden="true" />
        {addLabel}
      </button>
    </div>
  );
};
