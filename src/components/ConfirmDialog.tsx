import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/25 p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
          }
        }}
        className="w-full max-w-sm rounded-2xl bg-surface p-4 shadow-[0_4px_32px_rgba(0,0,0,0.2)]"
      >
        <h2 className="mb-3 px-1 text-xl font-medium">{title}</h2>
        <p className="px-1">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 font-medium text-accent uppercase hover:bg-accent/10"
          >
            Отмена
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-lg px-4 py-2 font-medium text-red-500 uppercase hover:bg-red-500/10"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
