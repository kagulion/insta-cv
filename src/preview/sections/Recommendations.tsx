import type { Cv } from '../../config';
import { joinFilled } from '../../lib/text';

type Props = { readonly cv: Cv };

export const Recommendations = ({ cv }: Props) => (
  <ul class="space-y-5 print:space-y-3">
    {(cv.recommendations ?? []).map(({ quote, author, role, company }, index) => (
      <li key={index}>
        <figure class="flex flex-col items-end pr-2">
          <blockquote class="relative max-w-full rounded-2xl rounded-br-none bg-border/60 px-4 py-2.5 after:absolute after:right-[-8px] after:bottom-0 after:size-2 after:bg-border/60 after:content-[''] after:[clip-path:polygon(0_0,100%_100%,0_100%)]">
            <p class="text-sm leading-snug text-pretty">{quote}</p>
          </blockquote>
          <figcaption class="mt-1.5 text-xs text-muted-foreground">
            {joinFilled([author, role, company], ', ')}
          </figcaption>
        </figure>
      </li>
    ))}
  </ul>
);
