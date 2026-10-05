import type { LabelKey } from './sections';

export type DefaultLabel = {
  readonly title: string;
  /** Короткое имя для меню. Нет значения, значит в меню идёт `title`. */
  readonly nav?: string;
};

export type DefaultLabels = {
  readonly sections: Readonly<Record<LabelKey, DefaultLabel>>;
  readonly availability: Readonly<Record<'format' | 'employment' | 'salary' | 'start', string>>;
  readonly pdfButton: string;
  readonly skipLink: string;
  readonly navLabel: string;
  readonly footerCredit: string;
};

/** Единственное место с русским текстом интерфейса, автор переопределяет его в `labels`. */
export const DEFAULT_LABELS: DefaultLabels = {
  sections: {
    contacts: { title: 'Контакты' },
    about: { title: 'О себе' },
    experience: { title: 'Опыт работы', nav: 'Опыт' },
    projects: { title: 'Проекты' },
    skills: { title: 'Навыки' },
    education: { title: 'Образование' },
    certificates: { title: 'Сертификаты и курсы', nav: 'Сертификаты' },
    achievements: { title: 'Достижения и награды', nav: 'Достижения' },
    publications: { title: 'Публикации и выступления', nav: 'Публикации' },
    openSource: { title: 'Open source' },
    languages: { title: 'Языки' },
    tools: { title: 'Инструменты и технологии', nav: 'Инструменты' },
    volunteering: { title: 'Волонтёрство' },
    interests: { title: 'Интересы и хобби', nav: 'Интересы' },
    recommendations: { title: 'Рекомендации' },
    availability: { title: 'Доступность' }
  },
  availability: {
    format: 'Формат работы',
    employment: 'Занятость',
    salary: 'Зарплатные ожидания',
    start: 'Срок выхода'
  },
  pdfButton: 'PDF',
  skipLink: 'Перейти к содержимому',
  navLabel: 'Содержание',
  footerCredit: 'Prosto CV'
};
