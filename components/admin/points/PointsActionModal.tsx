'use client';

import { useState } from 'react';
import { X, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/admin/ConfirmModal';
import type { PointsAction } from './types';

const PRIMARY = '#2ab5ad';
const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors';

const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toLocaleString()}`;

/** Add / deduct / edit / delete(void) / restore a points entry. Every change is a two-step flow:
 * fill in the details, then a confirm box that spells out exactly what will happen to the balance. */
export default function PointsActionModal({ action, onClose, onDone, expiryEnabled = false }: {
  action: PointsAction | null; onClose: () => void; onDone: () => void; expiryEnabled?: boolean;
}) {
  if (!action) return null;
  // Remount per action so form state never leaks between two different entries.
  return <Inner key={action.kind + ('entry' in action ? action.entry.id : action.user.id + action.direction)} action={action} onClose={onClose} onDone={onDone} expiryEnabled={expiryEnabled} />;
}

function Inner({ action, onClose, onDone, expiryEnabled }: { action: PointsAction; onClose: () => void; onDone: () => void; expiryEnabled: boolean }) {
  const [step, setStep] = useState<'form' | 'confirm'>(action.kind === 'restore' ? 'confirm' : 'form');
  const [saving, setSaving] = useState(false);

  const [direction, setDirection] = useState<'credit' | 'debit'>(action.kind === 'adjust' ? action.direction : 'credit');
  const [amount, setAmount] = useState(action.kind === 'edit' ? String(action.entry.points) : '');
  const [reason, setReason] = useState('');
  const [noExpiry, setNoExpiry] = useState(false);
  const [error, setError] = useState('');

  const balance = action.balance;
  const entry = action.kind === 'adjust' ? null : action.entry;

  // The signed change to the balance this action would cause.
  let delta = 0;
  if (action.kind === 'adjust') delta = (direction === 'credit' ? 1 : -1) * (Number(amount) || 0);
  if (action.kind === 'edit' && entry) delta = (Number(amount) || 0) - entry.points;
  if (action.kind === 'void' && entry) delta = -entry.points;
  if (action.kind === 'restore' && entry) delta = entry.points;
  const after = balance === null ? null : balance + delta;

  const validate = (): string => {
    if (action.kind === 'adjust') {
      const n = Number(amount);
      if (!Number.isInteger(n) || n <= 0) return 'Enter a whole number of points greater than 0.';
    }
    if (action.kind === 'edit' && entry) {
      const n = Number(amount);
      if (!Number.isInteger(n) || n === 0) return 'Points must be a whole number other than 0.';
      if (entry.type === 'EARNED' && n < 0) return 'An earned entry must stay positive.';
      if (entry.type === 'REDEEMED' && n > 0) return 'A redeemed entry must stay negative.';
      if (n === entry.points) return 'Points are unchanged — change the amount, or use Delete.';
    }
    if (reason.trim().length < 3) return 'A reason is required (at least 3 characters).';
    if (after !== null && after < 0) return `This would leave the balance negative (${after.toLocaleString()}).`;
    return '';
  };

  const submit = async () => {
    setSaving(true);
    try {
      let res: Response;
      if (action.kind === 'adjust') {
        const n = Number(amount);
        res = await fetch('/api/admin/points-ledger', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: action.user.id, points: direction === 'credit' ? n : -n, note: reason, noExpiry: direction === 'credit' && noExpiry }),
        });
      } else if (action.kind === 'edit') {
        res = await fetch(`/api/admin/points-ledger/${action.entry.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ points: Number(amount), note: reason }),
        });
      } else if (action.kind === 'void') {
        res = await fetch(`/api/admin/points-ledger/${action.entry.id}`, {
          method: 'DELETE', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
      } else {
        res = await fetch(`/api/admin/points-ledger/${action.entry.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restore: true }),
        });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? 'Could not save the change.');
        if (action.kind !== 'restore') setStep('form');
        else onClose();
        return;
      }
      toast.success(
        action.kind === 'adjust' ? `${direction === 'credit' ? 'Added' : 'Deducted'} ${Number(amount).toLocaleString()} points`
        : action.kind === 'edit' ? 'Entry updated'
        : action.kind === 'void' ? 'Entry deleted (kept in history)'
        : 'Entry restored',
      );
      onDone();
      onClose();
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const title =
    action.kind === 'adjust' ? (direction === 'credit' ? 'Add points' : 'Deduct points')
    : action.kind === 'edit' ? 'Edit points entry'
    : action.kind === 'void' ? 'Delete points entry'
    : 'Restore points entry';

  const who = action.kind === 'adjust' ? action.user.name : entry?.user?.name;
  const balanceLine = balance !== null && after !== null ? ` Balance: ${balance.toLocaleString()} → ${after.toLocaleString()}.` : '';

  const confirmMessage =
    action.kind === 'adjust'
      ? `${direction === 'credit' ? 'Add' : 'Deduct'} ${Number(amount).toLocaleString()} points ${direction === 'credit' ? 'to' : 'from'} ${who}?${balanceLine} Reason: "${reason.trim()}".`
    : action.kind === 'edit' && entry
      ? `Change this entry${who ? ` (${who})` : ''} from ${signed(entry.points)} to ${signed(Number(amount))} points?${balanceLine} Reason: "${reason.trim()}". The edit is recorded in the audit log.`
    : action.kind === 'void' && entry
      ? `Delete this ${signed(entry.points)} point entry${who ? ` for ${who}` : ''}? It will stop counting toward the balance.${balanceLine} It stays in the history marked as deleted, and can be restored. Reason: "${reason.trim()}".`
    : entry
      ? `Restore this ${signed(entry.points)} point entry${who ? ` for ${who}` : ''}? It will count toward the balance again.${balanceLine}`
      : '';

  const danger = action.kind === 'void' || (action.kind === 'adjust' && direction === 'debit') || (action.kind === 'edit' && delta < 0);

  if (step === 'confirm') {
    return (
      <ConfirmModal
        open
        title={title + '?'}
        message={confirmMessage}
        confirmLabel={action.kind === 'void' ? 'Delete' : action.kind === 'restore' ? 'Restore' : 'Confirm'}
        variant={danger ? 'danger' : 'default'}
        loading={saving}
        onConfirm={submit}
        onCancel={() => (action.kind === 'restore' ? onClose() : setStep('form'))}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-50">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
            <Coins className="w-5 h-5" style={{ color: '#d97706' }} />
          </span>
          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            {who && <p className="text-xs text-gray-400">{who}</p>}
          </div>
        </div>

        {action.kind === 'adjust' && (
          <div className="grid grid-cols-2 gap-2">
            {(['credit', 'debit'] as const).map(d => (
              <button key={d} type="button" onClick={() => setDirection(d)}
                className="py-2.5 rounded-xl text-sm font-semibold border transition-colors"
                style={{
                  backgroundColor: direction === d ? (d === 'credit' ? '#16a34a' : '#dc2626') : '#fff',
                  color: direction === d ? '#fff' : '#6b7280',
                  borderColor: direction === d ? (d === 'credit' ? '#16a34a' : '#dc2626') : '#e5e7eb',
                }}>
                {d === 'credit' ? '+ Add points' : '− Deduct points'}
              </button>
            ))}
          </div>
        )}

        {action.kind === 'edit' && entry && (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3.5 py-2.5">
            Current: <span className="font-bold">{signed(entry.points)}</span> points ({entry.type.toLowerCase()}).
            {entry.type === 'EARNED' ? ' Must stay positive.' : entry.type === 'REDEEMED' ? ' Must stay negative.' : ''}
          </p>
        )}

        {action.kind === 'void' && entry && (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3.5 py-2.5">
            This {signed(entry.points)} point entry will stop counting toward the balance. It is kept in the history and can be restored.
          </p>
        )}

        {(action.kind === 'adjust' || action.kind === 'edit') && (
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
              {action.kind === 'adjust' ? 'Points' : 'New points (signed)'}
            </label>
            <input type="number" value={amount} onChange={e => { setAmount(e.target.value); setError(''); }} className={inp} placeholder="e.g. 50" autoFocus />
          </div>
        )}

        {action.kind === 'adjust' && direction === 'credit' && expiryEnabled && (
          <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={noExpiry} onChange={e => setNoExpiry(e.target.checked)} className="mt-0.5 accent-teal-600" />
            <span>These points <b>never expire</b> <span className="text-gray-400">(otherwise they expire like any other points)</span></span>
          </label>
        )}

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Reason (required)</label>
          <textarea value={reason} onChange={e => { setReason(e.target.value); setError(''); }} rows={2} maxLength={200}
            className={`${inp} resize-none`} placeholder={action.kind === 'void' ? 'Why is this being deleted?' : 'Why is this change being made?'} />
        </div>

        {balance !== null && after !== null && delta !== 0 && (
          <p className="text-xs font-semibold" style={{ color: after < 0 ? '#dc2626' : '#6b7280' }}>
            Balance: {balance.toLocaleString()} → <span style={{ color: after < 0 ? '#dc2626' : delta > 0 ? '#16a34a' : '#d97706' }}>{after.toLocaleString()}</span>
            {' '}({signed(delta)})
          </p>
        )}
        {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

        <div className="flex items-center gap-2.5 pt-1">
          <button onClick={onClose} className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => { const err = validate(); if (err) setError(err); else setStep('confirm'); }}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl text-white hover:opacity-90"
            style={{ backgroundColor: danger ? '#dc2626' : PRIMARY }}>
            Review
          </button>
        </div>
      </div>
    </div>
  );
}
