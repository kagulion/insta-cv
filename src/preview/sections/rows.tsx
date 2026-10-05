import type { Cv } from '../../config';
import { joinFilled } from '../../lib/text';
import { RowList } from '../components/RowList';

/** Секции-таблицы: период или год слева, название и подробности справа. */
type Props = { readonly cv: Cv };

export const Education = ({ cv }: Props) => (
  <RowList
    rows={(cv.education ?? []).map(({ institution, degree, field, period }) => ({
      title: institution,
      details: joinFilled([degree, field], ', '),
      ...(period === undefined ? {} : { aside: period })
    }))}
  />
);

export const Certificates = ({ cv }: Props) => (
  <RowList
    rows={(cv.certificates ?? []).map(({ title, issuer, year }) => ({
      title,
      details: joinFilled([issuer], ', '),
      ...(year === undefined ? {} : { aside: year })
    }))}
  />
);
