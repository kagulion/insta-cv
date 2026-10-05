import { OG_FONT_FAMILY } from './og-fonts';
import { OG_THEME } from './og-theme';
import { OG_HEIGHT, OG_WIDTH } from './seo';

export type OgCard = {
  readonly name: string;
  readonly position: string;
};

/** Узел дерева satori. Текст лежит в `children` как есть, экранирование не нужно. */
export type OgNode = {
  readonly type: string;
  readonly props: {
    readonly style: Readonly<Record<string, string | number>>;
    readonly children?: string | readonly OgNode[];
  };
};

const PADDING = 80;

/** Карточка 1200×630: имя и должность. Чистая функция, HTML не строится. */
export const buildOgMarkup = ({ name, position }: OgCard): OgNode => ({
  type: 'div',
  props: {
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      width: OG_WIDTH,
      height: OG_HEIGHT,
      padding: PADDING,
      backgroundColor: OG_THEME.background,
      borderBottom: `12px solid ${OG_THEME.border}`,
      fontFamily: OG_FONT_FAMILY
    },
    children: [
      {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column' },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  display: 'block',
                  lineClamp: 2,
                  fontSize: 72,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: OG_THEME.foreground
                },
                children: name
              }
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'block',
                  lineClamp: 2,
                  marginTop: 24,
                  fontSize: 36,
                  fontWeight: 400,
                  lineHeight: 1.3,
                  color: OG_THEME.mutedForeground
                },
                children: position
              }
            }
          ]
        }
      }
    ]
  }
});
