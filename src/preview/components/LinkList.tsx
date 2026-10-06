import { displayUrl } from '../../lib/display-url';
import { ExternalLink } from './ExternalLink';

type Props = {
  readonly items: readonly { readonly text: string; readonly url?: string }[];
};

export const LinkList = ({ items }: Props) =>
  items.length === 0 ? null : (
    <ul class="space-y-1">
      {items.map(({ text, url }, index) => (
        <li key={index} class="relative pl-5 text-sm text-pretty wrap-anywhere">
          <span
            aria-hidden="true"
            class="absolute top-[0.7em] left-0 h-px w-3 bg-muted-foreground"
          />
          {url !== undefined ? <ExternalLink href={url}>{text}</ExternalLink> : text}
          {url !== undefined && (
            <span class="hidden text-muted-foreground print:block">{displayUrl(url)}</span>
          )}
        </li>
      ))}
    </ul>
  );
