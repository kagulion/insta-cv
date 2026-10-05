import { DEFAULT_LABELS, type DefaultLabels } from './defaults';
import type { Cv } from './schema';
import { mapSectionKeys, type LabelKey } from './sections';

export type ResolvedLabels = {
  readonly sections: Readonly<Record<LabelKey, { readonly title: string; readonly nav: string }>>;
  readonly availability: DefaultLabels['availability'];
  /** `null` значит «кнопки нет» (в конфиге `labels.pdfButton: false`). Подпись всегда из `DEFAULT_LABELS`. */
  readonly pdfButton: string | null;
  readonly skipLink: string;
  readonly navLabel: string;
  readonly footerCredit: string;
};

/**
 * Тексты интерфейса для страницы: конфиг поверх русских значений по умолчанию.
 * Имя для меню: `nav` из конфига, затем `title` из конфига, затем `nav` и `title` по умолчанию.
 */
export const resolveLabels = (cv: Cv): ResolvedLabels => ({
  sections: mapSectionKeys((key) => {
    const custom = cv.labels?.sections?.[key];
    const fallback = DEFAULT_LABELS.sections[key];
    return {
      title: custom?.title ?? fallback.title,
      nav: custom?.nav ?? custom?.title ?? fallback.nav ?? fallback.title
    };
  }),
  availability: {
    format: cv.labels?.availability?.format ?? DEFAULT_LABELS.availability.format,
    employment: cv.labels?.availability?.employment ?? DEFAULT_LABELS.availability.employment,
    salary: cv.labels?.availability?.salary ?? DEFAULT_LABELS.availability.salary,
    start: cv.labels?.availability?.start ?? DEFAULT_LABELS.availability.start
  },
  pdfButton: cv.labels?.pdfButton === false ? null : DEFAULT_LABELS.pdfButton,
  skipLink: cv.labels?.skipLink ?? DEFAULT_LABELS.skipLink,
  navLabel: cv.labels?.navLabel ?? DEFAULT_LABELS.navLabel,
  footerCredit: cv.footer.credit ?? DEFAULT_LABELS.footerCredit
});
