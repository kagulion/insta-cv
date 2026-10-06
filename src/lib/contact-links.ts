import type { Cv } from '../config';

export const CONTACT_ORDER = [
  'phone',
  'email',
  'telegram',
  'github',
  'linkedin',
  'location'
] as const;

export type ContactKind = (typeof CONTACT_ORDER)[number];

/** `link` это произвольная ссылка из `contacts.links`. */
export type ContactItemKind = ContactKind | 'link';

/** Контакт для шапки: что показать и, если это ссылка, куда вести. У локации `href` нет. */
export type ContactItem = {
  readonly kind: ContactItemKind;
  readonly display: string;
  readonly href?: string;
};

/** Контакт со ссылкой: всё, кроме локации. */
export type LinkItem = ContactItem & { readonly href: string };

/** Заполненные контакты в порядке `CONTACT_ORDER`, свои ссылки перед локацией. */
export const buildContactLinks = (contacts: Cv['contacts']): readonly ContactItem[] =>
  CONTACT_ORDER.flatMap((kind): readonly ContactItem[] => {
    if (kind === 'location') {
      const { location } = contacts;
      const custom = (contacts.links ?? []).map(({ display, href }): ContactItem => ({
        kind: 'link',
        display,
        href
      }));
      return [...custom, ...(location === undefined ? [] : [{ kind, display: location.display }])];
    }
    const contact = contacts[kind];
    return contact === undefined ? [] : [{ kind, display: contact.display, href: contact.href }];
  });

/** Контакты-ссылки для шапки и отдельно город (он идёт текстом, не ссылкой). */
export const splitContacts = (
  contacts: Cv['contacts']
): { readonly links: readonly LinkItem[]; readonly location?: string } => {
  const items = buildContactLinks(contacts);
  return {
    links: items.filter((item): item is LinkItem => item.href !== undefined),
    location: items.find(({ kind }) => kind === 'location')?.display
  };
};
