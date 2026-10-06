import { resolveLabels } from '../config';
import { draft, preview, updateDraft } from '../state/draft';
import type { Draft } from '../state/envelope';
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
type Availability = NonNullable<Draft['availability']>;

const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
  updateDraft((cv) => ({ ...cv, [key]: value }));

const setContact = <K extends keyof Contacts>(key: K, value: Contacts[K]) =>
  updateDraft((cv) => ({ ...cv, contacts: { ...cv.contacts, [key]: value } }));

const setAvailability = (key: keyof Availability, value: string) =>
  updateDraft((cv) => ({ ...cv, availability: { ...cv.availability, [key]: value } }));

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

  const listSection = <K extends ListSectionKey>(key: K, spec: ListSpec<Item<K>>) => (
    <EditorSection key={key} title={titles[key]} errorPaths={[key]}>
      <ListEditor
        items={(cv[key] ?? []) as Item<K>[]}
        onChange={(items) => set(key, items as Draft[K])}
        path={key}
        {...spec}
      />
    </EditorSection>
  );

  const textSection = (key: 'volunteering' | 'interests', placeholder: string) => (
    <EditorSection key={key} title={titles[key]} errorPaths={[key]}>
      <TextArea
        label={titles[key]}
        path={key}
        value={cv[key] ?? ''}
        placeholder={placeholder}
        hint="Пустая строка начинает новый абзац"
        onChange={(value) => set(key, value)}
      />
    </EditorSection>
  );

  const tagsSection = (key: 'skills' | 'tools', placeholder: string) => (
    <EditorSection key={key} title={titles[key]} errorPaths={[key]}>
      <TagsField
        label={titles[key]}
        value={cv[key] ?? []}
        placeholder={placeholder}
        onChange={(value) => set(key, value)}
      />
    </EditorSection>
  );

  return (
    <div>
      <EditorSection
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
          hint="Пустая строка начинает новый абзац"
          required
          rows={5}
          onChange={(value) => set('about', value)}
        />
      </EditorSection>

      <EditorSection title={titles.contacts} errorPaths={['contacts']}>
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

      {listSection('experience', EXPERIENCE)}
      {tagsSection('skills', 'TypeScript, React')}
      {listSection('projects', PROJECTS)}
      {listSection('education', EDUCATION)}
      {listSection('certificates', CERTIFICATES)}
      {listSection('achievements', ACHIEVEMENTS)}
      {listSection('publications', PUBLICATIONS)}
      {listSection('openSource', OPEN_SOURCE)}
      {listSection('languages', LANGUAGES)}
      {tagsSection('tools', 'Git, Figma')}
      {textSection('volunteering', 'Где и чем помогали')}
      {textSection('interests', 'Чем увлекаетесь')}
      {listSection('recommendations', RECOMMENDATIONS)}

      <EditorSection title={titles.availability} errorPaths={['availability']}>
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
    </div>
  );
};
