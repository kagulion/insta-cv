import { ArrowUpRight } from 'lucide-preact';
import type { Cv } from '../../config';
import { displayUrl } from '../../lib/display-url';
import { TagList } from '../components/TagList';

type Props = { readonly cv: Cv };

const CARD_CLASS =
  'relative flex min-w-0 flex-col rounded-lg border p-4 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-foreground';

export const Projects = ({ cv }: Props) => (
  <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 print:grid-cols-2">
    {(cv.projects ?? []).map(({ name, url, description, tech }, index) => (
      <li key={index} class={url === undefined ? CARD_CLASS : `${CARD_CLASS} project-card group`}>
        <h3 class="flex items-start justify-between gap-2 text-base leading-snug font-medium tracking-tight">
          {url !== undefined ? (
            <>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                class="outline-none after:absolute after:inset-0 after:rounded-lg"
              >
                {name}
              </a>
              <ArrowUpRight class="project-arrow size-4 shrink-0 print:hidden" aria-hidden="true" />
            </>
          ) : (
            name
          )}
        </h3>
        {url !== undefined && (
          <p class="mt-0.5 hidden text-[0.8125rem] leading-snug wrap-anywhere text-muted-foreground print:block">
            {displayUrl(url)}
          </p>
        )}
        {description !== undefined && (
          <p class="mt-0.5 text-[0.8125rem] leading-snug text-muted-foreground">{description}</p>
        )}
        <div class="mt-auto pt-3">
          <TagList items={tech ?? []} max={6} />
        </div>
      </li>
    ))}
  </ul>
);
