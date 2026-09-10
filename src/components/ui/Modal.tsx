import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ModalProps = {
  title: string;
  description?: string;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
};

export const Modal = ({
  title,
  description,
  onClose,
  children,
  footer,
}: ModalProps) => {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeHandler = useRef(onClose);

  closeHandler.current = onClose;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeHandler.current();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        className="absolute inset-0 bg-scrim"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/60",
          children ? "max-w-xl" : "max-w-md",
        )}
      >
        <header
          className={cn(
            "flex justify-between gap-3 px-5 py-4",
            description ? "items-start" : "items-center",
            children ? "border-b border-line" : "pb-2",
          )}
        >
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-heading">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-sm text-ink-400">{description}</p>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-overlay hover:text-heading"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        {children ? (
          <div className="scrollbar-slim overflow-y-auto p-5">{children}</div>
        ) : null}

        {footer ? (
          <div
            className={cn(
              "flex justify-end gap-2 px-5 pb-4",
              children ? "border-t border-line pt-4" : "pt-2",
            )}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
};
