const levenshtein = (a: string, b: string): number => {
  const initialRow = Array.from({ length: b.length + 1 }, (_, j) => j);
  const lastRow = [...a].reduce<readonly number[]>(
    (previous, charA, i) =>
      [...b].reduce<readonly number[]>(
        (row, charB, j) => {
          const substitution = (previous[j] ?? 0) + (charA === charB ? 0 : 1);
          const insertion = (row[j] ?? 0) + 1;
          const deletion = (previous[j + 1] ?? 0) + 1;
          return [...row, Math.min(substitution, insertion, deletion)];
        },
        [i + 1]
      ),
    initialRow
  );
  return lastRow[b.length] ?? 0;
};

/** Ближайший известный ключ, если опечатка небольшая, иначе `undefined`. */
export const suggestKey = (input: string, known: readonly string[]): string | undefined => {
  const lowered = input.toLowerCase();
  const scored = known.map((key) => ({ key, distance: levenshtein(lowered, key.toLowerCase()) }));
  const best = scored.reduce<(typeof scored)[number] | undefined>(
    (acc, candidate) => (acc === undefined || candidate.distance < acc.distance ? candidate : acc),
    undefined
  );
  if (best === undefined) return undefined;
  const tolerance = Math.max(1, Math.floor(input.length / 3));
  return best.distance <= tolerance && best.distance < input.length ? best.key : undefined;
};
