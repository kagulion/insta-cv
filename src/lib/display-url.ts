/** Адрес для показа на бумаге: без схемы, `www.` и завершающего слэша. */
export const displayUrl = (url: string): string =>
  url
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');
