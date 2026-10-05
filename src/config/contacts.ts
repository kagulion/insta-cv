import { z } from 'zod';
import { optionalText, required, strictObject, text } from './fields';
import { detectIcon, GENERIC_ICON, isKnownIcon } from './link-icons';

export const LINK_KINDS = ['phone', 'email', 'telegram', 'github', 'linkedin'] as const;
export type LinkKind = (typeof LINK_KINDS)[number];

/** Контакт, готовый для страницы: что показать и куда вести. */
export type ContactLink = { readonly display: string; readonly href: string };

type Normalized =
  | { readonly ok: true; readonly link: ContactLink }
  | { readonly ok: false; readonly message: string };

const link = (display: string, href: string): Normalized => ({ ok: true, link: { display, href } });
const fail = (message: string): Normalized => ({ ok: false, message });

const PHONE_CHARS = /^\+?[\d\s().-]+$/;
const MIN_PHONE_DIGITS = 7;

const normalizePhone = (value: string): Normalized => {
  if (!PHONE_CHARS.test(value)) {
    return fail('в телефоне допустимы цифры, пробелы, скобки, дефис и ведущий +');
  }
  const digits = value.replace(/\D/g, '');
  if (digits.length < MIN_PHONE_DIGITS) {
    return fail(`в номере телефона меньше ${MIN_PHONE_DIGITS} цифр`);
  }
  return link(value, `tel:${value.startsWith('+') ? '+' : ''}${digits}`);
};

const normalizeEmail = (value: string): Normalized =>
  z.email().safeParse(value).success
    ? link(value, `mailto:${value}`)
    : fail('неверный адрес электронной почты');

type ProfileRule = {
  /** Что срезать с начала: схему, домен, `@`. Чужой домен не срезается и не пройдёт проверку логина. */
  readonly prefix: RegExp;
  readonly login: RegExp;
  readonly displayBase: string;
  readonly hrefBase: string;
  readonly example: string;
};

const profile =
  ({ prefix, login, displayBase, hrefBase, example }: ProfileRule) =>
  (value: string): Normalized => {
    const id = value.replace(prefix, '').replace(/\/$/, '');
    return login.test(id)
      ? link(`${displayBase}${id}`, `${hrefBase}${id}`)
      : fail(`ожидался логин или ссылка вида ${example}`);
  };

const normalizeTelegram = profile({
  prefix: /^(?:(?:https?:\/\/)?t\.me\/|@)/i,
  login: /^[A-Za-z0-9_]{5,32}$/,
  displayBase: 't.me/',
  hrefBase: 'https://t.me/',
  example: 't.me/логин (от 5 до 32 символов: латиница, цифры, _)'
});

const normalizeGithub = profile({
  prefix: /^(?:https?:\/\/)?(?:www\.)?github\.com\//i,
  login: /^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/,
  displayBase: 'github.com/',
  hrefBase: 'https://github.com/',
  example: 'github.com/логин'
});

const normalizeLinkedin = profile({
  prefix: /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\//i,
  login: /^[A-Za-z0-9_%-]{3,100}$/,
  displayBase: 'linkedin.com/in/',
  hrefBase: 'https://www.linkedin.com/in/',
  example: 'linkedin.com/in/имя'
});

const normalizers: Readonly<Record<LinkKind, (value: string) => Normalized>> = {
  phone: normalizePhone,
  email: normalizeEmail,
  telegram: normalizeTelegram,
  github: normalizeGithub,
  linkedin: normalizeLinkedin
};

/** Схема одного контакта: строка на входе, `{ display, href }` на выходе, неверное значение это ошибка. */
const linkSchema = (kind: LinkKind) =>
  text.transform((value, ctx): ContactLink => {
    const result = normalizers[kind](value);
    if (result.ok) return result.link;
    ctx.issues.push({ code: 'custom', message: result.message, input: value });
    return z.NEVER;
  });

const emptyAsMissing = text.transform((value) => (value === '' ? undefined : value));

/** Контакт в конфиге: пустая строка значит «контакта нет». */
export const optionalLink = (kind: LinkKind) =>
  emptyAsMissing.pipe(linkSchema(kind).optional()).optional();

/** Произвольная ссылка: `ContactLink` плюс имя иконки (бренд из `BRAND_ICON_NAMES` или `link`). */
export type CustomLink = ContactLink & { readonly icon: string };

const SCHEME = /^[a-z][a-z\d+.-]*:/i;

const normalizeCustom = (
  url: string,
  icon?: string,
  label?: string
): { readonly message: string } | CustomLink => {
  let parsed: URL;
  try {
    parsed = new URL(SCHEME.test(url) ? url : `https://${url}`);
  } catch {
    return { message: 'ожидалась ссылка вида https://example.com/profile' };
  }
  if (!/^https?:$/.test(parsed.protocol) || !parsed.hostname.includes('.')) {
    return { message: 'ожидалась ссылка вида https://example.com/profile (только http и https)' };
  }
  const name = icon?.toLowerCase();
  if (name !== undefined && !isKnownIcon(name)) {
    return {
      message: `неизвестная иконка «${icon}»: выберите бренд из списка (например behance) или ${GENERIC_ICON}`
    };
  }
  const shown = `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname}`.replace(/\/$/, '');
  return {
    display: label ?? shown,
    href: parsed.href,
    icon: name ?? detectIcon(parsed.hostname)
  };
};

/**
 * Своя ссылка в контактах: `{ url, icon?, label? }`. Адрес можно без схемы (`behance.net/ivanov`).
 * Иконка определяется по домену, `icon` задаёт её вручную, `label` подпись вместо адреса.
 */
const customLinkSchema = strictObject({
  url: required,
  icon: optionalText,
  label: optionalText
}).transform((input, ctx): CustomLink => {
  const result = normalizeCustom(input.url, input.icon, input.label);
  if (!('message' in result)) return result;
  ctx.issues.push({ code: 'custom', message: result.message, input: input.url, path: ['url'] });
  return z.NEVER;
});

export const customLinks = z.array(customLinkSchema).optional();

/** Локация: просто текст, без ссылки. */
export const optionalLocation = text
  .transform((value) => (value === '' ? undefined : { display: value }))
  .optional();
