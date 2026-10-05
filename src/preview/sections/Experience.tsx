import type { Cv } from '../../config';

type Props = { readonly cv: Cv };

export const Experience = ({ cv }: Props) => (
  <ul class="space-y-5 print:space-y-3">
    {(cv.experience ?? []).map(({ position, company, period, bullets }, index) => (
      <li key={index}>
        <div class="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <h3 class="min-w-0 text-base leading-snug font-medium tracking-tight text-balance">
            {position}
          </h3>
          <p class="text-xs text-balance text-muted-foreground tabular-nums sm:max-w-[34%] sm:shrink-0 sm:text-right">
            {period}
          </p>
        </div>
        <p class="text-sm text-muted-foreground">{company}</p>
        {bullets !== undefined && bullets.length > 0 && (
          <ul class="mt-3 space-y-1 print:mt-2">
            {bullets.map((bullet, bulletIndex) => (
              <li key={bulletIndex} class="relative pl-5 text-sm text-pretty">
                <span
                  aria-hidden="true"
                  class="absolute top-[0.7em] left-0 h-px w-3 bg-muted-foreground"
                />
                {bullet}
              </li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ul>
);
