import { joinFilled } from './text';

export type FooterInput = {
  readonly name: string;
  readonly year: number;
  readonly credit: string;
  readonly logo: boolean;
};

export type FooterLines = {
  readonly copyright: string;
  readonly credit: string;
  readonly logo: boolean;
};

/** Строки футера. Год приходит аргументом, поэтому функция чистая. */
export const buildFooter = ({ name, year, credit, logo }: FooterInput): FooterLines => ({
  copyright: joinFilled([`© ${year}`, name], ' '),
  credit,
  logo
});
