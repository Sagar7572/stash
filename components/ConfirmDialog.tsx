"use client";

export default function ConfirmDialog({
  open,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onCancel}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={message}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs rounded-xl bg-white p-5 text-center shadow-xl"
      >
        <p className="text-sm font-semibold text-ink">{message}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#E5E3F0] py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-tint-soft"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
