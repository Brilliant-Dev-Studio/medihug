'use client';

import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'default', loading = false,
  onConfirm, onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const danger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={() => !loading && onCancel()}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: danger ? '#fee2e2' : '#e6f7f7' }}
        >
          <AlertTriangle className="w-5 h-5" style={{ color: danger ? '#dc2626' : '#2ab5ad' }} />
        </div>

        <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{message}</p>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: danger ? '#dc2626' : '#2ab5ad' }}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
