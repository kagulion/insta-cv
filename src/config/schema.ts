import { z } from 'astro/zod';
import { customLinks, optionalLink, optionalLocation } from './contacts';
import {
  filled,
  list,
  optionalLongText,
  optionalText,
  optionalUrl,
  required,
  requiredLong,
  strictObject,
  stringList,
  text
} from './fields';
import { mapSectionKeys, type SectionKey } from './sections';

const contacts = strictObject({
  phone: optionalLink('phone'),
  email: optionalLink('email'),
  telegram: optionalLink('telegram'),
  github: optionalLink('github'),
  linkedin: optionalLink('linkedin'),
  links: customLinks,
  location: optionalLocation
}).refine(
  ({ phone, email, telegram, github, linkedin, links }) =>
    [phone, email, telegram, github, linkedin].some((contact) => contact !== undefined) ||
    (links?.length ?? 0) > 0,
  { error: 'нужен хотя бы один контакт: phone, email, telegram, github, linkedin или links' }
);

/** Пункт публичного следа: строка или `{ text, url? }`, на выходе всегда `{ text, url? }`. */
const linkItem = z
  .union(
    [filled, strictObject({ text: required, url: optionalUrl })],
    'ожидалась строка или объект { text, url }'
  )
  .transform((item) => (typeof item === 'string' ? { text: item } : item));

const linkList = list(linkItem);

/** Год, строка или число, на выходе строка. */
const year = z
  .union([z.number().int(), text], 'ожидалась строка или число')
  .transform(String)
  .optional();

// `satisfies` не даёт забыть секцию из `SECTION_ORDER` и добавить лишнюю.
const sectionSchemas = {
  about: requiredLong,
  experience: list(
    strictObject({ position: required, company: required, period: required, bullets: stringList })
  ),
  projects: list(
    strictObject({
      name: required,
      description: optionalText,
      tech: stringList,
      url: optionalUrl
    })
  ),
  skills: stringList,
  education: list(
    strictObject({
      institution: required,
      degree: optionalText,
      field: optionalText,
      period: optionalText
    })
  ),
  certificates: list(strictObject({ title: required, issuer: optionalText, year })),
  achievements: linkList,
  publications: linkList,
  openSource: linkList,
  languages: list(strictObject({ name: required, level: optionalText, note: optionalText })),
  tools: stringList,
  volunteering: optionalLongText,
  interests: optionalLongText,
  recommendations: list(
    strictObject({
      quote: requiredLong,
      author: required,
      role: optionalText,
      company: optionalText
    })
  ),
  availability: strictObject({
    format: optionalText,
    employment: optionalText,
    salary: optionalText,
    start: optionalText
  }).optional()
} satisfies Record<SectionKey, z.ZodType>;

const sectionLabel = strictObject({ title: optionalText, nav: optionalText }).optional();

/** Подпись кнопки печати задана интерфейсом и не меняется. `false` убирает кнопку целиком. */
const pdfButton = z
  .literal(false, { error: 'подпись кнопки не меняется, допустимо только false' })
  .optional();

const availabilityLabels = strictObject({
  format: optionalText,
  employment: optionalText,
  salary: optionalText,
  start: optionalText
}).optional();

const labels = strictObject({
  sections: strictObject(mapSectionKeys(() => sectionLabel)).optional(),
  availability: availabilityLabels,
  pdfButton,
  skipLink: optionalText,
  navLabel: optionalText
}).optional();

/** SEO: заголовок и описание вместо выводимых, адрес сайта для canonical и превью, закрытие от индексации. */
const seo = strictObject({
  title: optionalText,
  description: optionalText,
  url: optionalUrl,
  noindex: z.boolean().optional()
}).optional();

/** Футер есть всегда. `logo: false` убирает логотип, `credit` задаёт его alt текст. */
const footer = strictObject({ logo: z.boolean().default(true), credit: optionalText }).default({
  logo: true
});

export const cvSchema = strictObject({
  lang: text
    .regex(/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/, 'ожидался код языка, например ru или en-US')
    .default('ru'),
  name: required.max(80),
  position: required.max(120),
  seo,
  contacts,
  ...sectionSchemas,
  labels,
  footer
});

/** Что пишет автор в `cv.config.ts`. */
export type CvInput = z.input<typeof cvSchema>;

/** Что получает страница: проверенный и очищенный конфиг. */
export type Cv = z.output<typeof cvSchema>;
