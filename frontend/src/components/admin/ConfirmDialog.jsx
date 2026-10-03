import { useState } from "react";

// A friendly "Are you sure?" — a bottom sheet on phones, a centred card
// on larger screens. Replaces the browser's plain confirm() popup, and
// can optionally ask for a short reason (used when cancelling an order).
const ConfirmDialog = ({
  title,
  message,
  confirmLabel = "Yes, continue",
  cancelLabel = "Go back",
  danger = false,
  withReason = false,
  reasonLabel = "Reason (optional)",
  reasonPlaceholder = "",
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-berry-800/50" onClick={onCancel} />
      <div className="pb-safe relative w-full max-w-md rounded-t-xl3 bg-white p-6 shadow-lift sm:rounded-xl3">
        <h3 className="font-display text-xl font-semibold text-berry-500">{title}</h3>
        {message && <p className="mt-2 text-sm leading-relaxed text-mauve-500">{message}</p>}

        {withReason && (
          <div className="mt-4">
            <label className="form-label">{reasonLabel}</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              className="input-field"
            />
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="btn-secondary touch-target">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            className={`touch-target inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-rose-500 hover:bg-rose-600"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
