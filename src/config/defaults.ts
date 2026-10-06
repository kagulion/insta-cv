import type { LabelKey } from './sections';

export type DefaultLabels = {
  readonly sections: Readonly<Record<LabelKey, string>>;
  readonly availability: Readonly<Record<'format' | 'employment' | 'salary' | 'start', string>>;
};

/** Единственное место с русским текстом интерфейса, пользователь переопределяет его в `labels`. */
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
    openSource: 'Open source',
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
