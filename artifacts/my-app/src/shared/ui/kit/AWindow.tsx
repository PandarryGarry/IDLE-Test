import React, { useEffect } from 'react';

/**
 * `AWindow` — ЕДИНСТВЕННЫЙ каркас модального окна игры (шаг 8 аудита).
 * Рецепт эталона «Ложа таверны»: вуаль с блюром + матовое стекло
 * (--glass-bg/edge/shadow/filter), заголовок кремом, тонкий золотой край.
 *
 * Две старые реализации (GModal в gameUI и самодельный каркас
 * UniversalInfoModal) делегируют сюда, чтобы окно было ОДНО.
 *
 * Контракты, которые нельзя ломать:
 *   - `role="dialog"` + `aria-modal` — находят QA-скрипты и читалки;
 *   - у вуали классы `fixed inset-0 z-50` — селектор попапа в QA-кадрах;
 *   - у кнопки крестика `aria-label="Закрыть"`.
 */
export interface AWindowProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  /** Действия справа в шапке (до крестика). */
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  width?: number | string;
  closeOnOverlay?: boolean;
  className?: string;
}

export function AWindow({
  open,
  onClose,
  title,
  headerActions,
  children,
  width = 340,
  closeOnOverlay = true,
  className = '',
}: AWindowProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="a-window__veil fixed inset-0 z-50"
        style={{ zIndex: 200 }}
        onClick={closeOnOverlay ? onClose : undefined}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`a-window ${className}`}
        style={{
          width: `min(${typeof width === 'number' ? `${width}px` : width}, 92vw)`,
        }}
      >
        {Boolean(title) && (
          <div className="a-window__head">
            <span className="a-window__title">{title}</span>
            <span className="a-window__actions">
              {headerActions}
              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
                className="a-window__close"
              >
                ✕
              </button>
            </span>
          </div>
        )}
        <div className="a-window__body">{children}</div>
      </div>
    </>
  );
}
