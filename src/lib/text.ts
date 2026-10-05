/** Склеивает заполненные части через разделитель. Пустые и `undefined` пропускаются, если частей нет, вернёт `''`. */
export const joinFilled = (parts: readonly (string | undefined)[], separator: string): string =>
  parts.filter((part) => part !== undefined && part !== '').join(separator);
