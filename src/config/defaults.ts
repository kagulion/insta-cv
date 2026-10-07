import type { LabelKey } from './sections';

export type DefaultLabels = {
  readonly sections: Readonly<Record<LabelKey, string>>;
  readonly availability: Readonly<Record<'format' | 'employment' | 'salary' | 'start', string>>;
};

/** Названия секций и подписи доступности на листе по умолчанию: пользователь переопределяет их в `labels`. */
export const DEFAULT_LABELS: DefaultLabels = {
  sections: {
    contacts: 'Контакты',
    about: 'О себе',
    experience: 'Опыт работы',
    projects: 'Проекты',
    skills: 'Навыки',
    education: 'Образование',
    certificates: 'Сертификаты и курсы',
    achievements: 'Достижения и награды',
    publications: 'Публикации и выступления',
    openSource: 'Open Source',
    languages: 'Языки',
    tools: 'Инструменты и технологии',
    volunteering: 'Волонтёрство',
    interests: 'Интересы и хобби',
    recommendations: 'Рекомендации',
    availability: 'Доступность'
  },
  availability: {
    format: 'Формат работы',
    employment: 'Занятость',
    salary: 'Зарплатные ожидания',
    start: 'Срок выхода'
  }
};

/** Название новой своей секции, пока пользователь не задал своё. */
export const DEFAULT_CUSTOM_TITLE = 'Новая секция';
