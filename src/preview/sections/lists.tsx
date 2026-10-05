import type { Cv } from '../../config';
import { LinkList } from '../components/LinkList';
import { Paragraphs } from '../components/Paragraphs';
import { TagList } from '../components/TagList';

/** Простые секции: обёртки над общими блоками. */
type Props = { readonly cv: Cv };

export const Skills = ({ cv }: Props) => <TagList items={cv.skills ?? []} variant="solid" />;
export const Tools = ({ cv }: Props) => <TagList items={cv.tools ?? []} variant="solid" />;

export const Achievements = ({ cv }: Props) => <LinkList items={cv.achievements ?? []} />;
export const Publications = ({ cv }: Props) => <LinkList items={cv.publications ?? []} />;
export const OpenSource = ({ cv }: Props) => <LinkList items={cv.openSource ?? []} />;

export const Volunteering = ({ cv }: Props) => <Paragraphs text={cv.volunteering ?? ''} />;
export const Interests = ({ cv }: Props) => <Paragraphs text={cv.interests ?? ''} />;
