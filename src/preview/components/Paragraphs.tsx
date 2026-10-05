import { splitParagraphs } from '../../lib/page-sections';

type Props = {
  readonly text: string;
};

export const Paragraphs = ({ text }: Props) => (
  <div class="space-y-4 text-sm leading-relaxed text-foreground">
    {splitParagraphs(text).map((paragraph, index) => (
      <p key={index}>{paragraph}</p>
    ))}
  </div>
);
