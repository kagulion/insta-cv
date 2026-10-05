import type { ComponentChildren } from 'preact';

type Props = {
  readonly id: string;
  readonly title: string;
  readonly children: ComponentChildren;
};

export const Section = ({ id, title, children }: Props) => {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} class="pt-8 print:pt-8">
      <h2
        id={titleId}
        class="mb-4 text-xl leading-normal font-medium tracking-tight text-foreground print:mb-2"
      >
        {title}
      </h2>
      {children}
    </section>
  );
};
