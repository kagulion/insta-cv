/** Пикселей CSS в миллиметре: браузер считает 96 px на дюйм. */
const PX_PER_MM = 96 / 25.4;

/**
 * Размеры листа A4 и полей. Должны совпадать с `@page` и `padding` у `body` в `resume.css`.
 */
export const PAPER = {
  width: 210 * PX_PER_MM,
  height: 297 * PX_PER_MM,
  margin: 12 * PX_PER_MM
} as const;

/** Высота содержимого на одной странице: лист минус верхнее и нижнее поле. */
const PAGE_CONTENT = PAPER.height - 2 * PAPER.margin;

export type Pagination = {
  readonly pages: number;
  /** Высота превью: целое число страниц, чтобы последняя выглядела листом, а не обрезком. */
  readonly height: number;
};

/**
 * Разбивка непрерывного листа на страницы по высоте `body` (с полями). Это оценка:
 * при печати браузер переносит пункты списков целиком, и страниц может стать больше.
 * Небольшой допуск не даёт округлению пикселей добавить пустую страницу.
 */
export const paginate = (bodyHeight: number): Pagination => {
  const content = Math.max(0, bodyHeight - 2 * PAPER.margin);
  const pages = Math.max(1, Math.ceil((content - 1) / PAGE_CONTENT));
  return {
    pages,
    height: 2 * PAPER.margin + pages * PAGE_CONTENT
  };
};

/** Масштаб листа под ширину панели: не больше 1, чтобы на широком экране не было мыла. */
export const fitScale = (available: number): number =>
  available <= 0 ? 1 : Math.min(1, available / PAPER.width);
