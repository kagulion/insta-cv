import type { LinkItem } from '../../lib/contact-links';
import { CONTACTS_ID, splitParagraphs } from '../../lib/page-sections';
import { Paragraph } from './Paragraph';

type Props = {
  readonly name: string;
  readonly position: string;
  /** Город в одном блоке с именем и специализацией. Нет значения, значит строки нет. */
  readonly location?: string;
  /** Текст «О себе» под специализацией, без заголовка. */
  readonly about: string;
  readonly contactsTitle: string;
  readonly contacts: readonly LinkItem[];
};

/** Подсказка вместо незаполненного поля: видна только в превью, в печать не попадает. */
const Placeholder = ({ text }: { readonly text: string }) => (
  <span class="placeholder text-muted-foreground/50">{text}</span>
);

// tel: и mailto: открывает система, новое окно нужно только веб-ссылкам.
const isWeb = (href: string): boolean => /^https?:/i.test(href);

export const Hero = ({ name, position, location, about, contactsTitle, contacts }: Props) => {
  const paragraphs = splitParagraphs(about);
  const titleId = `${CONTACTS_ID}-title`;

  return (
    <header class="pt-12 sm:pt-16 print:pt-0 print:pb-4">
      <div class="min-w-0">
        <div class="font-normal tracking-tight">
          <h1 class="text-2xl font-medium">
            {name !== '' ? name : <Placeholder text="Имя и фамилия" />}
          </h1>
          <p class="mt-0.5 flex flex-col text-base text-muted-foreground sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-4">
            <span>{position !== '' ? position : <Placeholder text="Должность" />}</span>
            {location !== undefined && (
              <span class="sm:flex sm:items-baseline sm:gap-x-4">
                <span
                  aria-hidden="true"
                  class={`hidden size-[3px] self-center bg-current sm:inline-block print:size-[2px] ${position === '' ? 'placeholder' : ''}`}
                />
                {location}
              </span>
            )}
          </p>
        </div>
        {paragraphs.length > 0 && (
          <div class="mt-8 space-y-4 text-base leading-relaxed text-pretty print:mt-6">
            {paragraphs.map((lines, index) => (
              <Paragraph key={index} lines={lines} />
            ))}
          </div>
        )}
      </div>
      {contacts.length > 0 && (
        <section id={CONTACTS_ID} aria-labelledby={titleId} class="mt-8 print:mt-6">
          <h2 id={titleId} class="sr-only">
            {contactsTitle}
          </h2>
          <ul class="flex flex-row flex-wrap items-start gap-2 print:gap-x-6 print:gap-y-2">
            {contacts.map(({ display, href }, index) => (
              <li key={index} class="max-w-full min-w-0 wrap-anywhere">
                <a
                  class="icon-button text-sm text-foreground/75"
                  href={href}
                  title={display}
                  {...(isWeb(href) && { target: '_blank', rel: 'noopener noreferrer' })}
                >
                  {display}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </header>
  );
};
