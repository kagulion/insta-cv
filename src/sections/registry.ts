import type { SectionKey } from '../config';
import Availability from './Availability.astro';
import Achievements from './Achievements.astro';
import Certificates from './Certificates.astro';
import Education from './Education.astro';
import Experience from './Experience.astro';
import Languages from './Languages.astro';
import Interests from './Interests.astro';
import OpenSource from './OpenSource.astro';
import Projects from './Projects.astro';
import Publications from './Publications.astro';
import Recommendations from './Recommendations.astro';
import Skills from './Skills.astro';
import Tools from './Tools.astro';
import Volunteering from './Volunteering.astro';

export type SectionComponent = typeof Experience;

/**
 * Реестр компонентов секций: запись на каждый ключ `SECTION_ORDER`.
 * `null` значит «у секции нет своего компонента»: «О себе» рисует `Hero`, остальные ждут компонента. Новая секция заменяет свой `null`.
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
