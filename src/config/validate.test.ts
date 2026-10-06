import { describe, expect, it } from 'vitest';
import { DEMO_CV } from '../data/demo';
import { previewConfig, validateConfig } from './validate';

const minimal = {
  name: 'Иван Иванов',
  position: 'Разработчик',
  about: 'Пишу код.',
  contacts: { email: 'ivan@example.com' }
};

const issuesOf = (raw: unknown) => {
  const result = validateConfig(raw);
  if (result.ok) throw new Error('ожидалась ошибка проверки');
  return result.issues;
};

describe('validateConfig', () => {
  it('принимает демо-резюме', () => {
    expect(validateConfig(DEMO_CV).ok).toBe(true);
  });

  it('подставляет значения по умолчанию', () => {
    const result = validateConfig(minimal);
    expect(result.ok && result.cv.lang).toBe('ru');
    expect(result.ok && result.cv.footer).toEqual({ logo: true });
  });

  it('убирает пустые необязательные поля и списки', () => {
    const result = validateConfig({ ...minimal, skills: [], interests: '  ', education: [] });
    if (!result.ok) throw new Error('ожидался успех');
    expect(result.cv).not.toHaveProperty('skills');
    expect(result.cv).not.toHaveProperty('interests');
    expect(result.cv).not.toHaveProperty('education');
  });

  it('собирает ссылки контактов из логинов', () => {
    const result = validateConfig({
      ...minimal,
      contacts: { telegram: '@ivan_dev', phone: '+7 (999) 123-45-67' }
    });
    if (!result.ok) throw new Error('ожидался успех');
    expect(result.cv.contacts.telegram).toEqual({
      display: 't.me/ivan_dev',
      href: 'https://t.me/ivan_dev'
    });
    expect(result.cv.contacts.phone?.href).toBe('tel:+79991234567');
  });

  it('своя ссылка показывается адресом без схемы и www', () => {
    const result = validateConfig({
      ...minimal,
      contacts: { links: [{ url: 'https://www.behance.net/ivan/' }] }
    });
    if (!result.ok) throw new Error('ожидался успех');
    expect(result.cv.contacts.links).toEqual([
      { display: 'behance.net/ivan', href: 'https://www.behance.net/ivan/' }
    ]);
  });

  it('ссылка проекта без схемы (www.…) становится https-ссылкой', () => {
    const result = validateConfig({
      ...minimal,
      projects: [{ name: 'Сайт', url: 'www.example.com/app' }]
    });
    if (!result.ok) throw new Error('ожидался успех');
    expect(result.cv.projects?.[0]?.url).toBe('https://www.example.com/app');
  });

  it('у своей ссылки нет подписи и иконки', () => {
    const paths = issuesOf({
      ...minimal,
      contacts: { links: [{ url: 'behance.net/ivan', label: 'Портфолио', icon: 'behance' }] }
    }).map(({ path }) => path);
    expect(paths).toEqual(['contacts.links[0].label', 'contacts.links[0].icon']);
  });

  it('требует обязательные поля с путями', () => {
    const paths = issuesOf({ ...minimal, name: '', experience: [{ position: 'Dev' }] }).map(
      ({ path }) => path
    );
    expect(paths).toContain('name');
    expect(paths).toContain('experience[0].company');
    expect(paths).toContain('experience[0].period');
  });

  it('требует хотя бы один контакт', () => {
    expect(issuesOf({ ...minimal, contacts: {} })).toEqual([
      {
        path: 'contacts',
        keys: ['contacts'],
        message:
          'Нужен хотя бы один контакт: телефон, почта, Telegram, GitHub, LinkedIn или своя ссылка'
      }
    ]);
  });

  it('сообщения об ошибках начинаются с заглавной буквы', () => {
    const issues = issuesOf({ ...minimal, contacts: { phone: 'abc' } });
    expect(issues.map(({ message }) => message)).toEqual([
      'В телефоне допустимы цифры, пробелы, скобки, дефис и ведущий +'
    ]);
  });

  it('подсказывает ключ при опечатке', () => {
    expect(issuesOf({ ...minimal, skils: ['TS'] })).toEqual([
      {
        path: 'skils',
        keys: ['skils'],
        message: 'Неизвестный ключ, возможно, имелось в виду skills'
      }
    ]);
  });

  it('пустые элементы списков не ошибка', () => {
    const result = validateConfig({
      ...minimal,
      skills: ['TS', '', '  '],
      experience: [{ position: '', company: '', period: '', bullets: [''] }]
    });
    if (!result.ok) throw new Error('ожидался успех');
    expect(result.cv.skills).toEqual(['TS']);
    expect(result.cv).not.toHaveProperty('experience');
  });

  it('ошибку своей ссылки привязывает к полю адреса', () => {
    const paths = issuesOf({ ...minimal, contacts: { links: [{ url: 'не ссылка' }] } }).map(
      ({ path }) => path
    );
    expect(paths).toEqual(['contacts.links[0].url']);
  });

  it('пишет путь ошибки по шагам', () => {
    expect(issuesOf({ ...minimal, name: '' })[0]?.keys).toEqual(['name']);
  });
});

describe('previewConfig', () => {
  it('рисует пустое резюме', () => {
    const cv = previewConfig({ name: '', position: '', about: '', contacts: {} });
    expect(cv.name).toBe('');
    expect(cv.contacts).toEqual({});
  });

  it('показывает недозаполненный элемент списка', () => {
    const cv = previewConfig({
      ...minimal,
      experience: [{ position: 'Dev', company: '', period: '' }]
    });
    expect(cv.experience).toEqual([{ position: 'Dev', company: '', period: '' }]);
  });

  it('отбрасывает неверные значения и оставляет остальное', () => {
    const cv = previewConfig({
      ...minimal,
      contacts: { email: 'ivan@', telegram: '@ivan_dev', links: [{ url: 'нет ссылки' }] },
      projects: [{ name: 'Сайт', url: 'ftp://x' }]
    });
    expect(cv.contacts.email).toBeUndefined();
    expect(cv.contacts.telegram?.href).toBe('https://t.me/ivan_dev');
    expect(cv.contacts.links).toBeUndefined();
    expect(cv.projects).toEqual([{ name: 'Сайт' }]);
    expect(cv.name).toBe('Иван Иванов');
  });

  it('убирает элемент списка без обязательного поля', () => {
    const cv = previewConfig({ ...minimal, languages: [{ level: 'B2' }, { name: 'Русский' }] });
    expect(cv.languages).toEqual([{ name: 'Русский' }]);
  });

  it('не падает на мусоре', () => {
    expect(previewConfig(null).name).toBe('');
    expect(previewConfig({ name: 42, contacts: 'x' }).name).toBe('');
  });
});
