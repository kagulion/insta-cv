import { pluralRu } from '../lib/text';
import { printPreview } from '../preview/printing';
import { fieldErrors, touchAll } from './errors';

/**
 * Печать с проверкой: если обязательные поля пусты или где-то ошибка, человек видит их
 * в форме и решает, печатать ли всё равно. Подсказки-заглушки на бумагу не попадают.
 */
export const requestPrint = (): void => {
  const errors = fieldErrors.peek();
  if (errors.size > 0) {
    touchAll(errors.keys());
    const fields = `${errors.size} ${pluralRu(errors.size, ['поле', 'поля', 'полей'])}`;
    const proceed = window.confirm(
      `Не заполнено или заполнено с ошибкой: ${fields}. Такие поля отмечены в форме красным.\n\nВсё равно напечатать?`
    );
    if (!proceed) return;
  }
  printPreview();
};
