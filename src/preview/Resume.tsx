import { resolveLabels, type Cv } from '../config';
import { splitContacts } from '../lib/contact-links';
import { buildSections } from '../lib/page-sections';
import { Hero } from './components/Hero';
import { Paragraphs } from './components/Paragraphs';
import { Section } from './components/Section';
import { SECTION_REGISTRY } from './sections/registry';

type Props = {
  readonly cv: Cv;
};

/** Резюме целиком: то, что раньше собирала `index.astro`, без навигации, SEO и футера. */
export const Resume = ({ cv }: Props) => {
  const labels = resolveLabels(cv);
  const sections = buildSections(cv, labels, SECTION_REGISTRY);
  // Локация не иконка-контакт: она идёт текстом под специализацией.
  const { links: contacts, location } = splitContacts(cv.contacts);

  return (
    <div class="mx-auto flex min-h-dvh w-full max-w-176 flex-col px-4 wrap-break-word sm:px-6 print:min-h-0">
      <Hero
        name={cv.name}
        position={cv.position}
        location={location}
        about={cv.about}
        contactsTitle={labels.sections.contacts}
        contacts={contacts}
      />
      {sections.length > 0 && (
        <main id="main" class="relative mt-8 print:mt-0">
          {sections.map(({ id, title, component: Content, text }) => (
            <Section key={id} id={id} title={title}>
              {Content !== undefined ? <Content cv={cv} /> : <Paragraphs text={text ?? ''} />}
            </Section>
          ))}
        </main>
      )}
    </div>
  );
};
