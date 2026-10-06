import type { ComponentChildren } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';
import resumeCss from '../styles/resume.css?inline';
import { fitScale, paginate, PAPER } from './paper';
import { isPrintShortcut, previewWindow } from './printing';

const SKELETON = '<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>';

/** Отступ вокруг листа в панели превью, px. Совпадает с `p-6` у контейнера. */
const GUTTER = 24;

/** Язык и заголовок документа превью. Отдельно от компонента: это запись во внешний DOM. */
const applyMeta = (doc: Document, lang: string, title: string): void => {
  doc.documentElement.lang = lang;
  doc.title = title;
};

type Props = {
  readonly lang: string;
  /** Заголовок документа в iframe: браузер берёт его как имя файла при «Сохранить как PDF». */
  readonly documentTitle: string;
  /** Ctrl+P, нажатое, пока фокус внутри листа. */
  readonly onPrintShortcut: () => void;
  readonly children: ComponentChildren;
};

/**
 * Превью в виде листа A4. Резюме живёт в iframe шириной 210 мм: у него свои стили, свой
 * viewport для брейкпоинтов и своя печать. Лист масштабируется под ширину панели, высота
 * iframe равна целому числу страниц, а пунктир показывает, где примерно пройдут разрывы.
 * Содержимое рендерится порталом, поэтому остаётся частью одного дерева Preact.
 */
export const PreviewFrame = ({ lang, documentTitle, onPrintShortcut, children }: Props) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [bodyHeight, setBodyHeight] = useState<number>(PAPER.height);
  const [available, setAvailable] = useState(0);

  const attach = () => {
    const doc = frameRef.current?.contentDocument;
    if (doc !== null && doc !== undefined) setBody(doc.body);
  };

  // Окно для кнопки печати. Эффектом, а не в `attach`: так оно переживает горячую замену модуля.
  useEffect(() => {
    if (body === null) return;
    previewWindow.value = body.ownerDocument.defaultView;
    return () => void (previewWindow.value = null);
  }, [body]);

  useEffect(() => {
    if (body !== null) applyMeta(body.ownerDocument, lang, documentTitle);
  }, [body, lang, documentTitle]);

  // Высота листа по содержимому: правки, догрузка шрифтов, перенос строк. Первый замер
  // сразу: `ResizeObserver` срабатывает только на отрисовке, а скрытая вкладка не рисуется.
  useEffect(() => {
    const view = body?.ownerDocument.defaultView;
    if (body === null || view === null || view === undefined) return;
    const measure = () => setBodyHeight(body.getBoundingClientRect().height);
    measure();
    const observer = new view.ResizeObserver(measure);
    observer.observe(body);
    return () => observer.disconnect();
  }, [body]);

  // Ширина панели: от неё масштаб листа.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport === null) return;
    const measure = () => setAvailable(viewport.clientWidth - 2 * GUTTER);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  // Ctrl+P при фокусе внутри листа печатало бы его без проверки полей.
  useEffect(() => {
    if (body === null) return;
    const doc = body.ownerDocument;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isPrintShortcut(event)) return;
      event.preventDefault();
      onPrintShortcut();
    };
    doc.addEventListener('keydown', onKeyDown);
    return () => doc.removeEventListener('keydown', onKeyDown);
  }, [body, onPrintShortcut]);

  const { pages, height, breaks } = paginate(bodyHeight);
  const scale = fitScale(available);

  return (
    <div ref={viewportRef} class="h-full overflow-auto bg-zinc-200/70 p-6">
      <div class="mx-auto" style={{ width: PAPER.width * scale, height: height * scale }}>
        <div
          class="relative origin-top-left bg-white shadow-[0_1px_3px_rgb(0_0_0/0.08),0_8px_24px_rgb(0_0_0/0.08)]"
          style={{ width: PAPER.width, height, transform: `scale(${scale})` }}
        >
          <iframe
            ref={frameRef}
            srcdoc={SKELETON}
            onLoad={attach}
            title="Превью резюме"
            scrolling="no"
            class="block border-0"
            style={{ width: PAPER.width, height }}
          />
          {breaks.map((top, index) => (
            <div
              key={index}
              aria-hidden="true"
              class="pointer-events-none absolute inset-x-0 border-t border-dashed border-sky-500/70"
              style={{ top }}
            >
              <span class="absolute top-1 right-2 rounded bg-sky-500/10 px-1.5 py-0.5 text-[11px] text-sky-700">
                Стр. {index + 2}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p class="mt-3 text-center text-xs text-muted-foreground tabular-nums">
        A4, примерно {pages} стр. Пунктир — где пройдут разрывы
      </p>
      {body !== null &&
        createPortal(
          <>
            {/* Стили частью дерева: при правке CSS в dev строка `?inline` приходит заново. */}
            <style>{resumeCss}</style>
            {children}
          </>,
          body
        )}
    </div>
  );
};
