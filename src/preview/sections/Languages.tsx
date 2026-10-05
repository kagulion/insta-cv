import type { Cv } from '../../config';
import { languageParts } from '../../lib/languages';

type Props = { readonly cv: Cv };

export const Languages = ({ cv }: Props) => (
  <ul class="space-y-1 text-sm">
    {(cv.languages ?? []).map(languageParts).map(({ name, rest }, index) => (
      <li key={index}>
        <span class="font-medium">{name}</span>
        {rest}
      </li>
    ))}
  </ul>
);
