import { describe, expect, it } from 'vitest';
import { DEMO_CV } from '../data/demo';
import { validateConfig } from './validate';

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

  it('подбирает иконку своей ссылки по домену', () => {
    const result = validateConfig({ ...minimal, contacts: { links: ['behance.net/ivan'] } });
    if (!result.ok) throw new Error('ожидался успех');
    expect(result.cv.contacts.links?.[0]?.icon).toBe('behance');
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
        message: 'нужен хотя бы один контакт: phone, email, telegram, github, linkedin или links'
      }
    ]);
  });

  it('подсказывает ключ при опечатке', () => {
    expect(issuesOf({ ...minimal, skils: ['TS'] })).toEqual([
      { path: 'skils', message: 'неизвестный ключ, возможно, имелось в виду skills' }
    ]);
  });
});
