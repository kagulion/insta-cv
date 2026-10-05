import type { Cv } from '../config';
import { splitContacts } from './contact-links';
import { buildPersonJsonLd, serializeJsonLd } from './json-ld';
import { withTrailingSlash } from './links';
import { joinFilled } from './text';

export const OG_IMAGE_PATH = 'og.png';
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export type Seo = {
  readonly title: string;
  readonly description: string;
  readonly canonical?: string;
  readonly robots?: 'noindex';
  readonly og: {
    readonly title: string;
    readonly description: string;
    readonly type: 'website';
    readonly locale?: string;
    readonly url?: string;
    readonly image?: {
      readonly url: string;
      readonly width: typeof OG_WIDTH;
      readonly height: typeof OG_HEIGHT;
      readonly alt: string;
    };
  };
  readonly twitterCard?: 'summary_large_image';
  /** Уже сериализованная строка, безопасная для `<script>`. */
  readonly jsonLd?: string;
};

/** `en-US` даёт `en_US`, язык без региона не даёт ничего. */
const ogLocale = (lang: string): string | undefined => {
  const match = /^([A-Za-z]{2,3})-([A-Za-z]{2})$/.exec(lang);
  return match === null ? undefined : `${match[1]}_${match[2]?.toUpperCase()}`;
};

/** Всё для `<head>`: `<title>` и description по умолчанию из имени, должности и локации, а превью (og) всегда «имя» и «должность». Чистая функция. */
export const buildSeo = ({ cv }: { readonly cv: Cv }): Seo => {
  const title = cv.seo?.title ?? joinFilled([cv.name, cv.position], ', ');
  const location = splitContacts(cv.contacts).location;
  const description = cv.seo?.description ?? joinFilled([cv.position, location], ', ');
  const locale = ogLocale(cv.lang);
  const noindex = cv.seo?.noindex === true;
  const siteUrl = cv.seo?.url;
  const canonical = siteUrl === undefined ? undefined : new URL(siteUrl).href;
  const imageUrl =
    siteUrl === undefined ? undefined : new URL(OG_IMAGE_PATH, withTrailingSlash(siteUrl)).href;

  return {
    title,
    description,
    ...(canonical === undefined ? {} : { canonical }),
    ...(noindex ? { robots: 'noindex' as const } : {}),
    og: {
      title: cv.name,
      description: cv.position,
      type: 'website',
      ...(locale === undefined ? {} : { locale }),
      ...(canonical === undefined ? {} : { url: canonical }),
      ...(imageUrl === undefined
        ? {}
        : {
            image: {
              url: imageUrl,
              width: OG_WIDTH,
              height: OG_HEIGHT,
              alt: joinFilled([cv.name, cv.position], ', ')
            }
          })
    },
    ...(imageUrl === undefined ? {} : { twitterCard: 'summary_large_image' as const }),
    ...(canonical === undefined || noindex
      ? {}
      : { jsonLd: serializeJsonLd(buildPersonJsonLd(cv, canonical)) })
  };
};
