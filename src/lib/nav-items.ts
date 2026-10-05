/** Пункт меню: на какой якорь ведёт и что написано. */
export type NavItem = {
  readonly id: string;
  readonly label: string;
};

/**
 * Пункты меню из тех же секций, что рисует страница. Контакты в шапке, в меню их нет.
 * Секций нет, значит меню нет: возвращает пустой список.
 */
export const buildNavItems = (
  sections: readonly { readonly id: string; readonly nav: string }[]
): readonly NavItem[] => sections.map(({ id, nav }) => ({ id, label: nav }));
