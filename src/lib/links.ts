/** Адрес сайта как база для относительных путей: без `/` на конце `new URL` отбросит подпапку. */
export const withTrailingSlash = (url: string): string => (url.endsWith('/') ? url : `${url}/`);
