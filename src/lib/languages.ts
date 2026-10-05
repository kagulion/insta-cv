import { joinFilled } from './text';

/** Части строки языка: название и остаток («: уровень (пояснение)»). Пустые части не оставляют знаков. */
export const languageParts = ({
  name,
  level,
  note
}: {
  readonly name: string;
  readonly level?: string;
  readonly note?: string;
}): { readonly name: string; readonly rest: string } => {
  const levelPart = joinFilled([level], '');
  const notePart = joinFilled([note], '');
  return {
    name,
    rest: `${levelPart === '' ? '' : `: ${levelPart}`}${notePart === '' ? '' : ` (${notePart})`}`
  };
};
