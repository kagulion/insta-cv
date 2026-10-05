declare module 'virtual:brand-icons' {
  export const height: number;
  export const icons: Readonly<
    Record<string, { readonly body: string; readonly width: number } | undefined>
  >;
}
