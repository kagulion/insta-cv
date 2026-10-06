type Props = {
  /** Строки абзаца: перенос внутри абзаца виден небольшим отступом между ними. */
  readonly lines: readonly string[];
};

export const Paragraph = ({ lines }: Props) => (
  <p>
    {lines.map((line, index) => (
      <span key={index} class={index === 0 ? 'block' : 'mt-2 block'}>
        {line}
      </span>
    ))}
  </p>
);
