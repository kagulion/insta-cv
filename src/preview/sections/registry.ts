import type { ComponentType } from 'preact';
import type { Cv, SectionKey } from '../../config';
import { Availability } from './Availability';
import { Experience } from './Experience';
import { Languages } from './Languages';
import {
  Achievements,
  Interests,
  OpenSource,
  Publications,
  Skills,
  Tools,
  Volunteering
} from './lists';
import { Projects } from './Projects';
import { Recommendations } from './Recommendations';
import { Certificates, Education } from './rows';

export type SectionComponent = ComponentType<{ readonly cv: Cv }>;

/**
 * Реестр компонентов секций: запись на каждый ключ `SECTION_ORDER`.
 * `null` значит «у секции нет своего компонента»: «О себе» рисует `Hero`.
 */
export const SECTION_REGISTRY: Readonly<Record<SectionKey, SectionComponent | null>> = {
  about: null,
  experience: Experience,
  projects: Projects,
  skills: Skills,
  education: Education,
  certificates: Certificates,
  achievements: Achievements,
  publications: Publications,
  openSource: OpenSource,
  languages: Languages,
  tools: Tools,
  volunteering: Volunteering,
  interests: Interests,
  recommendations: Recommendations,
  availability: Availability
};
