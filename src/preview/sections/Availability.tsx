import { Fragment } from 'preact';
import { resolveLabels, type Cv } from '../../config';
import { buildAvailabilityRows } from '../../lib/availability';

type Props = { readonly cv: Cv };

export const Availability = ({ cv }: Props) => (
  <dl class="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
    {buildAvailabilityRows(cv.availability, resolveLabels(cv).availability).map(
      ({ key, label, value }) => (
        <Fragment key={key}>
          <dt class="wrap-anywhere text-muted-foreground">{label}</dt>
          <dd class="mb-2 wrap-anywhere sm:mb-0">{value}</dd>
        </Fragment>
      )
    )}
  </dl>
);
