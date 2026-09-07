'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface DangerDeleteModalProps {
  open: boolean;
  title: string;
  message: string;
  /** Exact text the admin must type before the delete button enables — the extra
   * confirmation step so a stray click can't destroy a record. */
  itemName: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DangerDeleteModal({
  open, title, message, itemName,
  confirmLabel = 'Delete', cancelLabel = 'Cancel',
  loading = false, onConfirm, onCancel,
}: DangerDeleteModalProps) {
  const [typed, setTyped] = useState('');

  useEffect(() => { if (open) setTyped(''); }, [open]);

  if (!open) return null;

  const matched = typed.trim().length > 0 && typed.trim() === itemName.trim();

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

        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#fee2e2' }}>
          <AlertTriangle className="w-5 h-5" style={{ color: '#dc2626' }} />
        </div>

        <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-4">{message}</p>

        <label className="block text-xs text-gray-400 mb-1.5">
          Type <span className="font-bold text-gray-700">{itemName}</span> to confirm
        </label>
        <input
          type="text"
          value={typed}
          onChange={e => setTyped(e.target.value)}
          disabled={loading}
          placeholder={itemName}
          autoFocus
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 disabled:opacity-50"
        />

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
            disabled={loading || !matched}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#dc2626' }}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
