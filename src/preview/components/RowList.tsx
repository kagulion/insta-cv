export type Row = {
  readonly title: string;
  /** Слева: год или период. Нет значения, значит колонка в строке пустая. */
  readonly aside?: string;
  /** Под названием, приглушённо. */
  readonly details?: string;
};

type Props = {
  readonly rows: readonly Row[];
};

export const RowList = ({ rows }: Props) =>
  rows.length === 0 ? null : (
    <ul class="divide-y divide-border border-y border-border">
      {rows.map(({ title, aside, details }, index) => (
        <li
          key={index}
          class="grid grid-cols-1 gap-x-6 gap-y-0.5 py-3 sm:grid-cols-[6.5rem_minmax(0,1fr)] print:py-2"
        >
          {aside === undefined ? (
            <span aria-hidden="true" class="hidden sm:block" />
          ) : (
            <p class="text-sm leading-snug text-muted-foreground tabular-nums sm:pt-px">{aside}</p>
          )}
          <div class="min-w-0">
            <h3 class="text-base leading-snug font-medium tracking-tight">{title}</h3>
            {details !== undefined && details !== '' && (
              <p class="text-sm text-muted-foreground">{details}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
