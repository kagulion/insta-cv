import type { CvInput } from '../config';

/**
 * Демо-резюме на вымышленных данных: его видит пользователь при первом заходе,
 * пока в localStorage ничего не сохранено.
 */
export const DEMO_CV = {
  lang: 'ru',
  name: 'Алексей Кузнецов',
  position: 'Фронтенд-разработчик',

  contacts: {
    phone: '+7 916 482-17-35',
    email: 'alexey.kuznetsov@proton.me',
    telegram: 't.me/akuznetsov_dev',
    github: 'github.com/akuznetsov-dev',
    linkedin: 'linkedin.com/in/akuznetsov-dev',
    // Свои ссылки: только адрес, в резюме он показывается как есть.
    links: [{ url: 'behance.net/akuznetsov' }, { url: 'https://akuznetsov.dev' }],
    location: 'Санкт-Петербург'
  },

  about:
    'Фронтенд-разработчик с 3,5 годами опыта в продуктовой разработке. Делаю личные кабинеты и ' +
    'внутренние сервисы на React и TypeScript: от разбора макетов до выката и мониторинга. ' +
    'Слежу за производительностью и доступностью, люблю аккуратный код и понятные интерфейсы. ' +
    'Привык работать в одной команде с дизайнерами, бэкендерами и QA.',

  experience: [
    {
      position: 'Фронтенд-разработчик',
      company: 'ООО «Модуль Финтех»',
      period: 'июнь 2024 — н. в.',
      bullets: [
        'Развиваю личный кабинет для малого бизнеса (платежи, выписки, документы) на React и TypeScript',
        'Сократил время загрузки главной страницы кабинета с 4,2 до 2,1 с: code splitting, ленивая загрузка, оптимизация изображений и шрифтов',
        'Вместе с дизайнером собрал библиотеку UI-компонентов на Tailwind и Storybook, которой пользуются три команды',
        'Настроил в CI проверки линтером, типами и тестами, число регрессий после релизов заметно снизилось',
        'Провожу code review и помогаю адаптироваться двум джуниор-разработчикам'
      ]
    },
    {
      position: 'Junior фронтенд-разработчик',
      company: 'Студия «Пиксель Форж»',
      period: 'март 2023 — май 2024',
      bullets: [
        'Верстал адаптивные сайты и интернет-магазины на заказ, всего около 15 проектов',
        'Подключал REST API, настраивал сборку на Vite и деплой через GitHub Actions',
        'Покрыл тестами ключевые компоненты (Jest и Testing Library), перевёл часть проектов на TypeScript'
      ]
    }
  ],

  projects: [
    {
      name: 'Личный кабинет «Модуль Бизнес»',
      description: 'Платежи, выписки и документы для малого бизнеса',
      tech: ['React', 'TypeScript', 'Redux Toolkit', 'Tailwind']
    },
    {
      name: 'Планировщик задач',
      description: 'Канбан-доска с drag-and-drop и офлайн-режимом',
      tech: ['React', 'Zustand', 'Vite', 'IndexedDB']
    },
    {
      name: 'react-tiny-hooks',
      url: 'https://github.com/akuznetsov-dev/react-tiny-hooks',
      description: 'Небольшая библиотека хуков для React',
      tech: ['TypeScript', 'React', 'Vitest']
    }
  ],

  skills: [
    'JavaScript (ES6+)',
    'TypeScript',
    'React',
    'Redux Toolkit',
    'Zustand',
    'Next.js (база)',
    'Tailwind CSS',
    'HTML5',
    'CSS3/SCSS',
    'REST',
    'GraphQL (база)',
    'Jest',
    'Testing Library',
    'адаптивная и кроссбраузерная вёрстка'
  ],

  education: [
    {
      institution: 'Санкт-Петербургский политехнический университет',
      degree: 'бакалавр',
      field: 'Прикладная информатика',
      period: '2018–2022'
    }
  ],

  certificates: [
    { title: 'Профессия Фронтенд-разработчик', issuer: 'онлайн-школа', year: '2022' },
    { title: 'Advanced React', issuer: 'онлайн-курс', year: '2024' },
    { title: 'Web Accessibility Fundamentals', year: '2025' }
  ],

  achievements: [
    { text: 'Призёр внутреннего хакатона «Модуль Финтех» (2025)' },
    { text: 'Снижение LCP с 4,2 с до 2,1 с на главной странице личного кабинета' },
    { text: 'Благодарность от команды за внедрение библиотеки UI-компонентов' }
  ],

  publications: [
    {
      text: 'Статья «Как мы ускорили загрузку SPA вдвое», блог на Habr (2025)',
      url: 'https://habr.com/ru/users/akuznetsov-dev/'
    },
    { text: 'Доклад «Tailwind в продакшене: плюсы и подводные камни», внутренний митап (2025)' }
  ],

  openSource: [
    { text: 'Несколько PR в документацию и баг-фиксы в популярных UI-библиотеках' },
    {
      text: 'Библиотека хуков react-tiny-hooks (около 200 звёзд на GitHub)',
      url: 'https://github.com/akuznetsov-dev/react-tiny-hooks'
    }
  ],

  languages: [
    { name: 'Русский', level: 'родной' },
    { name: 'Английский', level: 'B2', note: 'чтение документации, переписка, code review' }
  ],

  tools: [
    'Git',
    'GitHub Actions',
    'Vite',
    'Webpack',
    'ESLint',
    'Prettier',
    'Figma',
    'Storybook',
    'Chrome DevTools',
    'Lighthouse',
    'Jira',
    'VS Code'
  ],

  volunteering:
    'Наставник в программе бесплатных курсов по веб-разработке для школьников (2024 — н. в.)',

  interests: 'Велопрогулки, настольные игры, чтение научпопа, дизайн интерфейсов',

  recommendations: [
    {
      quote:
        'Алексей быстро вникает в задачу и всегда доводит её до конца. С ним удобно работать над сложными интерфейсами',
      author: 'Анна Смирнова',
      role: 'Lead Designer',
      company: 'Модуль Финтех'
    },
    {
      quote: 'Надёжный разработчик, хорошо объясняет технические решения',
      author: 'Дмитрий Орлов',
      role: 'Tech Lead',
      company: 'Модуль Финтех'
    }
  ],

  availability: {
    format: 'удалёнка или гибрид',
    employment: 'полная',
    salary: 'от 200 000 ₽',
    start: 'через 2 недели'
  }
} satisfies CvInput;
