import { ArrowUpRight } from 'lucide-preact';
import type { ComponentChildren } from 'preact';

type Props = {
  readonly href: string;
  readonly children: ComponentChildren;
};

export const ExternalLink = ({ href, children }: Props) => (
  <a class="link print:no-underline" href={href} target="_blank" rel="noopener noreferrer">
    {children}
    <ArrowUpRight
      class="ml-0.5 inline-block size-[0.9em] align-[-0.1em] print:hidden"
      aria-hidden="true"
    />
  </a>
);
