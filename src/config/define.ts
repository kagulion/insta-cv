import type { CvInput } from './schema';

/**
 * Нужен только для подсказок типов в редакторе, возвращает объект как есть.
 * Лежит отдельно от загрузчика, чтобы `cv.config.ts` не импортировал сам себя по кругу.
 */
export const defineCV = (input: CvInput): CvInput => input;
