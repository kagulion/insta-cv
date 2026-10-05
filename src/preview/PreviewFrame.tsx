import type { ComponentChildren } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';
import resumeCss from '../styles/resume.css?inline';

const SKELETON = '<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>';

/** Язык и заголовок документа превью. Отдельно от компонента: это запись во внешний DOM. */
const applyMeta = (doc: Document, lang: string, title: string): void => {
  doc.documentElement.lang = lang;
  doc.title = title;
};

type Props = {
  readonly lang: string;
  /** Заголовок документа в iframe: браузер берёт его как имя файла при «Сохранить как PDF». */
  readonly documentTitle: string;
  readonly children: ComponentChildren;
};

/**
 * Превью в iframe: у резюме свой viewport (брейкпоинты `sm:` считаются по ширине превью,
 * а не окна), свои стили без стилей редактора и своя печать. Содержимое рендерится
 * порталом, поэтому остаётся частью одного дерева Preact.
 */
export const PreviewFrame = ({ lang, documentTitle, children }: Props) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);

  const attach = () => {
    const doc = frameRef.current?.contentDocument;
    if (doc !== null && doc !== undefined) setBody(doc.body);
  };

  useEffect(() => {
    if (body !== null) applyMeta(body.ownerDocument, lang, documentTitle);
  }, [body, lang, documentTitle]);

  return (
    <>
      <iframe
        ref={frameRef}
        srcdoc={SKELETON}
        onLoad={attach}
        title="Превью резюме"
        class="size-full border-0 bg-white"
      />
      {body !== null &&
        createPortal(
          <>
            {/* Стили частью дерева: при правке CSS в dev строка `?inline` приходит заново. */}
            <style>{resumeCss}</style>
            {children}
          </>,
          body
        )}
    </>
  );
};
