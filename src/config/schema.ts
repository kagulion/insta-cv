import { z } from 'zod';
import { customLinks, optionalLink, optionalLocation } from './contacts';
import {
  list,
  optionalLongText,
  optionalText,
  optionalUrl,
  required,
  requiredLongText,
  requiredText,
  strictObject,
  stringList,
  text,
  type Mode
} from './fields';
import { mapSectionKeys, type SectionKey } from './sections';

/** Пункт публичного следа: достижение, публикация, вклад в open source. */
const linkItem = strictObject({ text: required, url: optionalUrl });

const linkList = list(linkItem);

const sectionLabel = strictObject({ title: optionalText }).optional();

const availabilityFields = {
  format: optionalText,
  employment: optionalText,
  salary: optionalText,
  start: optionalText
};

const labels = strictObject({
  sections: strictObject(mapSectionKeys(() => sectionLabel)).optional(),
  availability: strictObject(availabilityFields).optional()
}).optional();

/** Футер из версии-сайта: на листе его нет, поле осталось, чтобы старые файлы импортировались. */
const footer = strictObject({ logo: z.boolean().default(true), credit: optionalText }).default({
  logo: true
});

const CONTACT_REQUIRED =
  'нужен хотя бы один контакт: телефон, почта, Telegram, GitHub, LinkedIn или своя ссылка';

/**
 * Схема резюме. Режимы различаются только обязательностью: в `lenient` пустые обязательные
 * поля и резюме без контактов допустимы, а неверные значения (почта, ссылки) остаются ошибкой.
 */
const createCvSchema = (mode: Mode) => {
  const req = requiredText(mode);
  const reqLong = requiredLongText(mode);

  const contactsShape = strictObject({
    phone: optionalLink('phone'),
    email: optionalLink('email'),
    telegram: optionalLink('telegram'),
    github: optionalLink('github'),
    linkedin: optionalLink('linkedin'),
    links: customLinks,
    location: optionalLocation
  });
  const contacts =
    mode === 'strict'
      ? contactsShape.refine(
          ({ phone, email, telegram, github, linkedin, links }) =>
            [phone, email, telegram, github, linkedin].some((contact) => contact !== undefined) ||
            (links?.length ?? 0) > 0,
          { error: CONTACT_REQUIRED }
        )
      : contactsShape;

  // `satisfies` не даёт забыть секцию из `SECTION_ORDER` и добавить лишнюю.
  const sectionSchemas = {
    about: reqLong,
    experience: list(
      strictObject({ position: req, company: req, period: req, bullets: stringList })
    ),
    projects: list(
      strictObject({ name: req, description: optionalText, tech: stringList, url: optionalUrl })
    ),
    skills: stringList,
    education: list(
      strictObject({
        institution: req,
        degree: optionalText,
        field: optionalText,
        period: optionalText
      })
    ),
    certificates: list(strictObject({ title: req, issuer: optionalText, year: optionalText })),
    achievements: linkList,
    publications: linkList,
    openSource: linkList,
    languages: list(strictObject({ name: req, level: optionalText, note: optionalText })),
    tools: stringList,
    volunteering: optionalLongText,
    interests: optionalLongText,
    recommendations: list(
      strictObject({ quote: reqLong, author: req, role: optionalText, company: optionalText })
    ),
    availability: strictObject(availabilityFields).optional()
  } satisfies Record<SectionKey, z.ZodType>;

  return strictObject({
    lang: text
      .regex(/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/, 'ожидался код языка, например ru или en-US')
      .default('ru'),
    name: req.max(80),
    position: req.max(120),
    contacts,
    ...sectionSchemas,
    labels,
    footer
  });
};

export const cvSchema = createCvSchema('strict');

/** Схема превью: та же форма данных, но без требований заполненности. */
export const previewSchema = createCvSchema('lenient');

/** Что вводит пользователь в редакторе: сырые данные до проверки. */
export type CvInput = z.input<typeof cvSchema>;

/** Что получает превью: проверенные и очищенные данные. */
export type Cv = z.output<typeof cvSchema>;
