import type { Cv } from '../config';
import { buildContactLinks } from './contact-links';

const SAME_AS_KINDS: readonly string[] = ['telegram', 'github', 'linkedin', 'link'];

export type PersonJsonLd = {
  readonly '@context': 'https://schema.org';
  readonly '@type': 'Person';
  readonly name: string;
  readonly jobTitle: string;
  readonly url: string;
  readonly sameAs?: readonly string[];
};

/** Person для поисковиков. Почты и телефона здесь нет намеренно. */
export const buildPersonJsonLd = (
  cv: Pick<Cv, 'name' | 'position' | 'contacts'>,
  url: string
): PersonJsonLd => {
  const sameAs = buildContactLinks(cv.contacts).flatMap((contact) =>
    SAME_AS_KINDS.includes(contact.kind) && contact.href !== undefined ? [contact.href] : []
  );
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: cv.name,
    jobTitle: cv.position,
    url,
    ...(sameAs.length > 0 ? { sameAs } : {})
  };
};

const ESCAPES: Readonly<Record<string, string>> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029'
};

/** JSON, безопасный внутри `<script>`: текст конфига не закроет тег. */
export const serializeJsonLd = (data: unknown): string =>
  JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (char) => ESCAPES[char] ?? char);
