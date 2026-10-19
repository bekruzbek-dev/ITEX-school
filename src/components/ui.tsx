import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cx } from "../lib/utils";

export function Spinner({ label = "Yuklanmoqda..." }: { label?: string }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="state state-empty">
      <div className="state-icon" aria-hidden="true">
        ◇
      </div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state state-error" role="alert">
      <div className="state-icon" aria-hidden="true">
        !
      </div>
      <h3>Ma’lumotlarni yuklab bo‘lmadi</h3>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-ghost" onClick={onRetry}>
          Qayta urinish
        </button>
      )}
    </div>
  );
}

/** loading / error / empty / data holatlarini bir joyda boshqaradi */
export function DataState<T>({
  loading,
  error,
  data,
  onRetry,
  emptyTitle,
  emptyText,
  children,
}: {
  loading: boolean;
  error: string | null;
  data: T[] | null;
  onRetry?: () => void;
  emptyTitle: string;
  emptyText?: string;
  children: (items: T[]) => ReactNode;
}) {
  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!data || data.length === 0) return <EmptyState title={emptyTitle} text={emptyText} />;
  return <>{children(data)}</>;
}

export function PageHero({ title, text }: { title: string; text?: string }) {
  return (
    <header className="page-hero">
      <div className="container">
        <h1>{title}</h1>
        {text && <p className="lead">{text}</p>}
      </div>
    </header>
  );
}

export function Section({
  title,
  text,
  action,
  children,
  id,
  tone,
}: {
  title?: string;
  text?: string;
  action?: { to: string; label: string };
  children: ReactNode;
  id?: string;
  tone?: "alt";
}) {
  return (
    <section id={id} className={cx("section", tone === "alt" && "section-alt")}>
      <div className="container">
        {title && (
          <div className="section-head">
            <div>
              <h2>{title}</h2>
              {text && <p className="muted">{text}</p>}
            </div>
            {action && (
              <Link className="link-more" to={action.to}>
                {action.label}
              </Link>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, []);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cx("modal", wide && "modal-wide")} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Yopish">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  text,
  confirmLabel = "O‘chirish",
  busy,
  onConfirm,
  onCancel,
}: {
  title: string;
  text: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p>{text}</p>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          Bekor qilish
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Bajarilmoqda..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function Img({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={cx("img-fallback", className)} role="img" aria-label={alt}>
        <span aria-hidden="true">{"</>"}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={className} />;
}
