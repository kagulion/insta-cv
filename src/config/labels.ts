import { DEFAULT_LABELS, type DefaultLabels } from './defaults';
import type { Cv } from './schema';
import { mapSectionKeys, type LabelKey } from './sections';

export type ResolvedLabels = {
  readonly sections: Readonly<Record<LabelKey, string>>;
  readonly availability: DefaultLabels['availability'];
  readonly footerCredit: string;
};

/** Тексты интерфейса для превью: свои подписи поверх русских значений по умолчанию. */
export const resolveLabels = (cv: Cv): ResolvedLabels => ({
  sections: mapSectionKeys(
    (key) => cv.labels?.sections?.[key]?.title ?? DEFAULT_LABELS.sections[key]
  ),
  availability: {
    format: cv.labels?.availability?.format ?? DEFAULT_LABELS.availability.format,
    employment: cv.labels?.availability?.employment ?? DEFAULT_LABELS.availability.employment,
    salary: cv.labels?.availability?.salary ?? DEFAULT_LABELS.availability.salary,
    start: cv.labels?.availability?.start ?? DEFAULT_LABELS.availability.start
  },
  footerCredit: cv.footer.credit ?? DEFAULT_LABELS.footerCredit
});
