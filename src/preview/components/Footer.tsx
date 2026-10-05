import logotype from '../../assets/logotype.svg';
import type { FooterLines } from '../../lib/footer';

export const Footer = ({ copyright, credit, logo }: FooterLines) => (
  <footer class="mt-auto pt-14 print:hidden">
    <div class="flex items-center justify-between gap-4 border-t border-border py-6">
      <p class="text-sm text-muted-foreground">{copyright}</p>
      {logo && (
        <img src={logotype} width={74} height={24} alt={credit} class="h-5 w-auto shrink-0" />
      )}
    </div>
  </footer>
);
