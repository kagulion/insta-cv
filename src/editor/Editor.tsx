import {
  DEFAULT_CUSTOM_TITLE,
  resolveLabels,
  resolveOrder,
  CUSTOM_PREFIX,
  type SectionKey
} from '../config';
import { DEFAULT_LABELS } from '../config/defaults';
import { draft, preview, updateDraft } from '../state/draft';
import type { Draft } from '../state/envelope';
import { Plus } from 'lucide-preact';
import type { ComponentChildren } from 'preact';
import { EditorSection } from './EditorSection';
import { fieldErrors } from './errors';
import { TagsField, TextArea, TextField } from './fields';
import { ListEditor } from './ListEditor';
import {
  ACHIEVEMENTS,
  CERTIFICATES,
  EDUCATION,
  EXPERIENCE,
  LANGUAGES,
  LINKS,
  OPEN_SOURCE,
  PROJECTS,
  PUBLICATIONS,
  RECOMMENDATIONS,
  type Item,
  type ListSpec
} from './specs';

type ListSectionKey =
  | 'experience'
  | 'projects'
  | 'education'
  | 'certificates'
  | 'achievements'
  | 'publications'
  | 'openSource'
  | 'languages'
  | 'recommendations';

type Contacts = Draft['contacts'];
type CustomSection = NonNullable<Draft['customSections']>[number];
type Availability = NonNullable<Draft['availability']>;

const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
  updateDraft((cv) => ({ ...cv, [key]: value }));

const setContact = <K extends keyof Contacts>(key: K, value: Contacts[K]) =>
  updateDraft((cv) => ({ ...cv, contacts: { ...cv.contacts, [key]: value } }));

const setAvailability = (key: keyof Availability, value: string) =>
  updateDraft((cv) => ({ ...cv, availability: { ...cv.availability, [key]: value } }));

const setLabelTitle = (key: SectionKey, title: string) =>
  updateDraft((cv) => ({
    ...cv,
    labels: { ...cv.labels, sections: { ...cv.labels?.sections, [key]: { title } } }
  }));

const setCustom = (id: string, patch: Partial<CustomSection>) =>
  updateDraft((cv) => ({
    ...cv,
    customSections: (cv.customSections ?? []).map((item) =>
      item.id === id ? { ...item, ...patch } : item
    )
  }));

const customIds = (cv: Draft): string[] => (cv.customSections ?? []).map(({ id }) => id);

/** Сдвигает секцию в порядке на листе на одну позицию. */
const moveSection = (key: string, delta: -1 | 1) =>
  updateDraft((cv) => {
    const order = [...resolveOrder(cv.order, customIds(cv))];
    const from = order.indexOf(key);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= order.length) return cv;
    order.splice(to, 0, ...order.splice(from, 1));
    return { ...cv, order };
  });

const addCustomSection = () => {
  const id = `${CUSTOM_PREFIX}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  updateDraft((cv) => ({
    ...cv,
    customSections: [...(cv.customSections ?? []), { id, title: DEFAULT_CUSTOM_TITLE, text: '' }]
  }));
  // Раскрываем новую секцию и ставим курсор в первое поле, когда она появится в DOM.
  requestAnimationFrame(() => {
    const details = document.querySelector<HTMLDetailsElement>(`details[data-section="${id}"]`);
    if (details === null) return;
    details.open = true;
    details.querySelector<HTMLElement>('input')?.focus();
  });
};

const removeCustomSection = (id: string, title: string) => {
  if (!window.confirm(`Удалить секцию «${title}»?`)) return;
  updateDraft((cv) => ({
    ...cv,
    customSections: (cv.customSections ?? []).filter((item) => item.id !== id),
    order: cv.order?.filter((key) => key !== id)
  }));
};

const CONTACT_FIELDS: readonly {
  readonly key: 'phone' | 'email' | 'telegram' | 'github' | 'linkedin';
  readonly label: string;
  readonly placeholder: string;
  readonly type?: 'email' | 'tel';
}[] = [
  { key: 'phone', label: 'Телефон', placeholder: '+7 999 123-45-67', type: 'tel' },
  { key: 'email', label: 'Почта', placeholder: 'ivan@example.com', type: 'email' },
  { key: 'telegram', label: 'Telegram', placeholder: '@ivan_dev или t.me/ivan_dev' },
  { key: 'github', label: 'GitHub', placeholder: 'ivan-dev или github.com/ivan-dev' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/ivan' }
];

const AVAILABILITY_PLACEHOLDERS: Readonly<Record<keyof Availability, string>> = {
  format: 'удалёнка или гибрид',
  employment: 'полная',
  salary: 'от 200 000 ₽',
  start: 'через 2 недели'
};

/** Форма резюме целиком: секции в том же порядке, что и на превью. */
export const Editor = () => {
  const cv = draft.value;
  const contacts = cv.contacts ?? {};
  const labels = resolveLabels(preview.value);
  const titles = labels.sections;
  const contactsError = fieldErrors.value.get('contacts');
  const custom = cv.customSections ?? [];
  const order = resolveOrder(cv.order, customIds(cv));

  /** Название и стрелки встроенной секции. */
  const controls = (key: SectionKey) => {
    const index = order.indexOf(key);
    return {
      rename: {
        value: cv.labels?.sections?.[key]?.title ?? '',
        placeholder: DEFAULT_LABELS.sections[key],
        path: `labels.sections.${key}.title`,
        onChange: (value: string) => setLabelTitle(key, value)
      },
      move: {
        up: index > 0 ? () => moveSection(key, -1) : null,
        down: index < order.length - 1 ? () => moveSection(key, 1) : null
      }
    };
  };

  const listSection = <K extends ListSectionKey>(key: K, spec: ListSpec<Item<K>>) => (
    <EditorSection key={key} id={key} title={titles[key]} errorPaths={[key]} {...controls(key)}>
      <ListEditor
        items={(cv[key] ?? []) as Item<K>[]}
        onChange={(items) => set(key, items as Draft[K])}
        path={key}
        {...spec}
      />
    </EditorSection>
  );

  const textSection = (key: 'volunteering' | 'interests', placeholder: string) => (
    <EditorSection key={key} id={key} title={titles[key]} errorPaths={[key]} {...controls(key)}>
      <TextArea
        label={titles[key]}
        path={key}
        value={cv[key] ?? ''}
        placeholder={placeholder}
        hint="Перенос строки даёт небольшой отступ, пустая строка — большой"
        onChange={(value) => set(key, value)}
      />
    </EditorSection>
  );

  const tagsSection = (key: 'skills' | 'tools', placeholder: string) => (
    <EditorSection key={key} id={key} title={titles[key]} errorPaths={[key]} {...controls(key)}>
      <TagsField
        label={titles[key]}
        value={cv[key] ?? []}
        placeholder={placeholder}
        onChange={(value) => set(key, value)}
      />
    </EditorSection>
  );

  const SECTIONS: Partial<Record<SectionKey, () => ComponentChildren>> = {
    experience: () => listSection('experience', EXPERIENCE),
    skills: () => tagsSection('skills', 'TypeScript, React'),
    projects: () => listSection('projects', PROJECTS),
    education: () => listSection('education', EDUCATION),
    certificates: () => listSection('certificates', CERTIFICATES),
    achievements: () => listSection('achievements', ACHIEVEMENTS),
    publications: () => listSection('publications', PUBLICATIONS),
    openSource: () => listSection('openSource', OPEN_SOURCE),
    languages: () => listSection('languages', LANGUAGES),
    tools: () => tagsSection('tools', 'Git, Figma'),
    volunteering: () => textSection('volunteering', 'Где и чем помогали'),
    interests: () => textSection('interests', 'Чем увлекаетесь'),
    recommendations: () => listSection('recommendations', RECOMMENDATIONS),
    availability: () => (
      <EditorSection
        key="availability"
        id="availability"
        title={titles.availability}
        errorPaths={['availability']}
        {...controls('availability')}
      >
        <div class="grid grid-cols-2 gap-3">
          {(Object.keys(AVAILABILITY_PLACEHOLDERS) as (keyof Availability)[]).map((key) => (
            <div key={key} class="col-span-2 sm:col-span-1">
              <TextField
                label={labels.availability[key]}
                path={`availability.${key}`}
                value={cv.availability?.[key] ?? ''}
                placeholder={AVAILABILITY_PLACEHOLDERS[key]}
                onChange={(value) => setAvailability(key, value)}
              />
            </div>
          ))}
        </div>
      </EditorSection>
    )
  };

  return (
    <div>
      <EditorSection
        id="main"
        title="Основное"
        errorPaths={['name', 'position', 'about', 'contacts.location']}
        defaultOpen
      >
        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2 sm:col-span-1">
            <TextField
              label="Имя и фамилия"
              path="name"
              value={cv.name ?? ''}
              placeholder="Иван Иванов"
              required
              onChange={(value) => set('name', value)}
            />
          </div>
          <div class="col-span-2 sm:col-span-1">
            <TextField
              label="Должность"
              path="position"
              value={cv.position ?? ''}
              placeholder="Фронтенд-разработчик"
              required
              onChange={(value) => set('position', value)}
            />
          </div>
          <div class="col-span-2">
            <TextField
              label="Город"
              path="contacts.location"
              value={contacts.location ?? ''}
              placeholder="Москва"
              onChange={(value) => setContact('location', value)}
            />
          </div>
        </div>
        <TextArea
          label={titles.about}
          path="about"
          value={cv.about ?? ''}
          placeholder="Опыт, специализация, чем полезны команде"
          hint="Перенос строки даёт небольшой отступ, пустая строка — большой"
          required
          rows={5}
          onChange={(value) => set('about', value)}
        />
      </EditorSection>

      <EditorSection id="contacts" title={titles.contacts} errorPaths={['contacts']}>
        {contactsError !== undefined && <p class="text-xs text-destructive">{contactsError}</p>}
        <div class="grid grid-cols-2 gap-3">
          {CONTACT_FIELDS.map(({ key, label, placeholder, type }) => (
            <div key={key} class="col-span-2 sm:col-span-1">
              <TextField
                label={label}
                path={`contacts.${key}`}
                value={contacts[key] ?? ''}
                placeholder={placeholder}
                type={type}
                onChange={(value) => setContact(key, value)}
              />
            </div>
          ))}
        </div>
        <div class="space-y-2">
          <p class="text-[13px] font-medium">Свои ссылки</p>
          <ListEditor
            items={contacts.links ?? []}
            onChange={(links) => setContact('links', links)}
            path="contacts.links"
            {...LINKS}
          />
        </div>
      </EditorSection>

      {order.map((key) => {
        const own = custom.find(({ id }) => id === key);
        if (own !== undefined) {
          const index = custom.indexOf(own);
          const position = order.indexOf(key);
          const title = own.title ?? DEFAULT_CUSTOM_TITLE;
          return (
            <EditorSection
              key={key}
              id={key}
              title={title}
              errorPaths={[`customSections[${index}]`]}
              rename={{
                value: own.title ?? '',
                placeholder: DEFAULT_CUSTOM_TITLE,
                path: `customSections[${index}].title`,
                onChange: (value) => setCustom(key, { title: value })
              }}
              move={{
                up: position > 0 ? () => moveSection(key, -1) : null,
                down: position < order.length - 1 ? () => moveSection(key, 1) : null
              }}
              onRemove={() => removeCustomSection(key, title)}
            >
              <TextArea
                label="Текст"
                path={`customSections[${index}].text`}
                value={own.text ?? ''}
                placeholder="Чем увлекаетесь"
                hint="Перенос строки даёт небольшой отступ, пустая строка — большой"
                onChange={(value) => setCustom(key, { text: value })}
              />
            </EditorSection>
          );
        }
        return SECTIONS[key as SectionKey]?.();
      })}

      <div class="px-5 py-4">
        <button
          type="button"
          onClick={addCustomSection}
          class="inline-flex items-center gap-1.5 rounded-md border border-dashed px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground"
        >
          <Plus class="size-4" aria-hidden="true" />
          Добавить секцию
        </button>
      </div>
    </div>
  );
};
