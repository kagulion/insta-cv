import { BRAND_ICON_NAMES } from '../config/brand-list';
import type { Draft } from '../state/envelope';
import type { FieldSpec } from './ListEditor';

/** Элемент списка из черновика: `Item<'experience'>` это одна должность. */
export type Item<K extends keyof Draft> =
  NonNullable<Draft[K]> extends readonly (infer I)[] ? I : never;

export type LinkItem = NonNullable<Draft['contacts']['links']>[number];

/** Описание секции-списка: поля формы, пустой элемент и заголовок карточки. */
export type ListSpec<T> = {
  readonly fields: readonly FieldSpec<T>[];
  readonly create: () => T;
  readonly title: (item: T) => string | undefined;
  readonly addLabel: string;
};

/** Подпись бренда в списке иконок: `x-twitter` → «X twitter». */
const brandLabel = (name: string): string => {
  const words = name.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const LINKS: ListSpec<LinkItem> = {
  fields: [
    { kind: 'url', key: 'url', label: 'Адрес', placeholder: 'behance.net/ivanov', required: true },
    {
      kind: 'text',
      key: 'label',
      label: 'Подпись',
      placeholder: 'Портфолио',
      hint: 'Видна в печати вместо адреса',
      half: true
    },
    {
      kind: 'select',
      key: 'icon',
      label: 'Иконка',
      half: true,
      options: [
        { value: '', label: 'По адресу сайта' },
        { value: 'link', label: 'Обычная ссылка' },
        ...BRAND_ICON_NAMES.map((name) => ({ value: name, label: brandLabel(name) }))
      ]
    }
  ],
  create: () => ({ url: '' }),
  title: (item) => item.label || item.url,
  addLabel: 'Добавить ссылку'
};

export const EXPERIENCE: ListSpec<Item<'experience'>> = {
  fields: [
    { kind: 'text', key: 'position', label: 'Должность', required: true, half: true },
    { kind: 'text', key: 'company', label: 'Компания', required: true, half: true },
    {
      kind: 'text',
      key: 'period',
      label: 'Период',
      placeholder: 'март 2023 — н. в.',
      required: true
    },
    {
      kind: 'lines',
      key: 'bullets',
      label: 'Задачи и результаты',
      hint: 'Каждый пункт с новой строки. Лучше с цифрами: «ускорил загрузку с 4 до 2 с»'
    }
  ],
  create: () => ({ position: '', company: '', period: '', bullets: [] }),
  title: (item) => [item.position, item.company].filter(Boolean).join(', '),
  addLabel: 'Добавить место работы'
};

export const PROJECTS: ListSpec<Item<'projects'>> = {
  fields: [
    { kind: 'text', key: 'name', label: 'Название', required: true, half: true },
    { kind: 'url', key: 'url', label: 'Ссылка', placeholder: 'https://', half: true },
    { kind: 'text', key: 'description', label: 'Коротко о проекте' },
    { kind: 'tags', key: 'tech', label: 'Технологии', placeholder: 'React, TypeScript' }
  ],
  create: () => ({ name: '' }),
  title: (item) => item.name,
  addLabel: 'Добавить проект'
};

export const EDUCATION: ListSpec<Item<'education'>> = {
  fields: [
    { kind: 'text', key: 'institution', label: 'Учебное заведение', required: true },
    { kind: 'text', key: 'degree', label: 'Степень', placeholder: 'бакалавр', half: true },
    { kind: 'text', key: 'field', label: 'Направление', half: true },
    { kind: 'text', key: 'period', label: 'Годы', placeholder: '2018–2022', half: true }
  ],
  create: () => ({ institution: '' }),
  title: (item) => item.institution,
  addLabel: 'Добавить учёбу'
};

export const CERTIFICATES: ListSpec<Item<'certificates'>> = {
  fields: [
    { kind: 'text', key: 'title', label: 'Название', required: true },
    { kind: 'text', key: 'issuer', label: 'Кто выдал', half: true },
    { kind: 'text', key: 'year', label: 'Год', placeholder: '2024', half: true }
  ],
  create: () => ({ title: '' }),
  title: (item) => item.title,
  addLabel: 'Добавить сертификат'
};

/** Достижения, публикации и open source устроены одинаково: текст и необязательная ссылка. */
const textItems = (addLabel: string): ListSpec<Item<'achievements'>> => ({
  fields: [
    { kind: 'text', key: 'text', label: 'Текст', required: true },
    { kind: 'url', key: 'url', label: 'Ссылка', placeholder: 'https://' }
  ],
  create: () => ({ text: '' }),
  title: (item) => item.text,
  addLabel
});

export const ACHIEVEMENTS = textItems('Добавить достижение');
export const PUBLICATIONS = textItems('Добавить публикацию');
export const OPEN_SOURCE = textItems('Добавить проект');

export const LANGUAGES: ListSpec<Item<'languages'>> = {
  fields: [
    { kind: 'text', key: 'name', label: 'Язык', required: true, half: true },
    { kind: 'text', key: 'level', label: 'Уровень', placeholder: 'B2', half: true },
    { kind: 'text', key: 'note', label: 'Пояснение', placeholder: 'читаю документацию' }
  ],
  create: () => ({ name: '' }),
  title: (item) => item.name,
  addLabel: 'Добавить язык'
};

export const RECOMMENDATIONS: ListSpec<Item<'recommendations'>> = {
  fields: [
    { kind: 'textarea', key: 'quote', label: 'Отзыв', required: true },
    { kind: 'text', key: 'author', label: 'Автор', required: true, half: true },
    { kind: 'text', key: 'role', label: 'Должность автора', half: true },
    { kind: 'text', key: 'company', label: 'Компания' }
  ],
  create: () => ({ quote: '', author: '' }),
  title: (item) => item.author,
  addLabel: 'Добавить рекомендацию'
};
