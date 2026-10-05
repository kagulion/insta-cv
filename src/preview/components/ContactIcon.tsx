import { Link, Mail, Smartphone } from 'lucide-preact';
import { findBrandIcon } from '../../config/link-icons';
import type { ContactItemKind } from '../../lib/contact-links';

type Props = {
  readonly kind: ContactItemKind;
  /** Имя иконки для `kind: 'link'`: бренд из списка или `link`. */
  readonly icon?: string;
};

const ICON_CLASS = 'size-[18px]';
const BRANDS: Partial<Record<ContactItemKind, string>> = {
  telegram: 'telegram',
  github: 'github',
  linkedin: 'linkedin'
};

export const ContactIcon = ({ kind, icon }: Props) => {
  if (kind === 'phone') return <Smartphone class={ICON_CLASS} aria-hidden="true" />;
  if (kind === 'email') return <Mail class={ICON_CLASS} aria-hidden="true" />;
  const brandName = kind === 'link' ? icon : BRANDS[kind];
  const brand = brandName === undefined ? undefined : findBrandIcon(brandName);
  // Своя ссылка без известного бренда получает общую иконку «ссылка».
  if (brand === undefined) return <Link class={ICON_CLASS} aria-hidden="true" />;
  return (
    <svg
      class={`${ICON_CLASS} text-zinc-700`}
      // У части иконок своя ширина (telegram, github шире общей): иначе viewBox обрезает их справа.
      viewBox={`0 0 ${brand.width} ${brand.height}`}
      fill="currentColor"
      aria-hidden="true"
      // Тела иконок берутся из пакета на сборке, пользовательского ввода в них нет.
      dangerouslySetInnerHTML={{ __html: brand.body }}
    />
  );
};
