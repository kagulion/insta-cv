import { splitParagraphs } from '../../lib/page-sections';
import { Paragraph } from './Paragraph';

type Props = {
  readonly text: string;
};

export const Paragraphs = ({ text }: Props) => (
  <div class="space-y-4 text-sm leading-relaxed text-foreground">
    {splitParagraphs(text).map((lines, index) => (
      <Paragraph key={index} lines={lines} />
    ))}
  </div>
);
