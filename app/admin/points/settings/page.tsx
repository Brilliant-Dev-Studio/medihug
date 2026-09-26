'use client';

import { useState, useEffect } from 'react';
import { Coins, Save, Loader2, ToggleLeft, ToggleRight, Hourglass, AlertTriangle } from 'lucide-react';
import ConfirmModal from '@/components/admin/ConfirmModal';

const PRIMARY = '#2ab5ad';
const inp = 'w-40 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

type Unit = 'DAYS' | 'MONTHS';
interface Preview {
  usersAffected: number; pointsLost: number; pointsRestored: number;
  balanceBefore: number; balanceAfter: number; expiringSoon30: { points: number; users: number };
}

export default function PointsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [kyatPerPointEarn, setKyatPerPointEarn] = useState('1000');
  const [kyatPerPointRedeem, setKyatPerPointRedeem] = useState('1000');
  const [isActive, setIsActive] = useState(true);

  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [expiryValue, setExpiryValue] = useState('12');
  const [expiryUnit, setExpiryUnit] = useState<Unit>('MONTHS');
  const [saved0, setSaved0] = useState({ enabled: false, value: 12, unit: 'MONTHS' as Unit });

  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewKey, setPreviewKey] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetch('/api/admin/points-settings')
      .then(r => r.json())
      .then(d => {
        if (d.settings) {
          setKyatPerPointEarn(String(d.settings.kyatPerPointEarn));
          setKyatPerPointRedeem(String(d.settings.kyatPerPointRedeem));
          setIsActive(d.settings.isActive);
          setExpiryEnabled(d.settings.expiryEnabled);
          setExpiryValue(String(d.settings.expiryValue));
          setExpiryUnit(d.settings.expiryUnit);
          setSaved0({ enabled: d.settings.expiryEnabled, value: d.settings.expiryValue, unit: d.settings.expiryUnit });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const valueNum = Number(expiryValue);
  const maxValue = expiryUnit === 'DAYS' ? 3650 : 120;
  const valueOk = Number.isInteger(valueNum) && valueNum >= 1 && valueNum <= maxValue;
  const expiryChanged = expiryEnabled !== saved0.enabled || (expiryEnabled && (valueNum !== saved0.value || expiryUnit !== saved0.unit));

  // Live "what would this do?" — waits a moment after typing, and only asks when the value is valid.
  const wantKey = valueOk ? `${expiryEnabled}|${valueNum}|${expiryUnit}` : '';
  useEffect(() => {
    if (!wantKey) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const res = await fetch('/api/admin/points-settings/expiry-preview', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: expiryEnabled, value: valueNum, unit: expiryUnit }),
      });
      const d = await res.json().catch(() => null);
      if (!cancelled && res.ok && d) { setPreview(d); setPreviewKey(wantKey); }
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [wantKey, expiryEnabled, valueNum, expiryUnit]);

  const previewReady = preview !== null && previewKey === wantKey;
  const loss = previewReady && preview ? preview.pointsLost : 0;

  const validate = (): boolean => {
    const earn = Number(kyatPerPointEarn);
    const redeem = Number(kyatPerPointRedeem);
    if (!Number.isFinite(earn) || earn <= 0 || !Number.isFinite(redeem) || redeem <= 0) {
      setError('တန်ဖိုးများ 0 ထက်ကြီးရပါမည်.');
      return false;
    }
    if (expiryEnabled && !valueOk) {
      setError(`Expiry time must be a whole number between 1 and ${maxValue.toLocaleString()} ${expiryUnit === 'DAYS' ? 'days' : 'months'}.`);
      return false;
    }
    setError('');
    return true;
  };

  const save = async () => {
    setConfirming(false); setSaving(true); setSaved(false);
    const res = await fetch('/api/admin/points-settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kyatPerPointEarn: Number(kyatPerPointEarn), kyatPerPointRedeem: Number(kyatPerPointRedeem), isActive,
        expiryEnabled, expiryValue: expiryEnabled ? valueNum : saved0.value, expiryUnit: expiryEnabled ? expiryUnit : saved0.unit,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      setSaved0({ enabled: expiryEnabled, value: expiryEnabled ? valueNum : saved0.value, unit: expiryEnabled ? expiryUnit : saved0.unit });
    } else { const d = await res.json().catch(() => ({})); setError(d.error ?? 'Save failed'); }
  };

  const onSave = () => {
    if (!validate()) return;
    // Changing expiry can wipe (or restore) points for many patients at once — always confirm first.
    if (expiryChanged) setConfirming(true); else save();
  };

  const period = `${valueNum} ${expiryUnit === 'DAYS' ? 'day' : 'month'}${valueNum === 1 ? '' : 's'}`;
  const confirmMessage = !expiryEnabled
    ? `Turn points expiry OFF? Points that have already expired will come back${previewReady && preview && preview.pointsRestored > 0 ? ` (${preview.pointsRestored.toLocaleString()} points for ${preview.usersAffected.toLocaleString()} patients)` : ''}, and points will never expire again.`
    : previewReady && preview
      ? `Points will expire ${period} after they were earned — this applies to ALL points, including ones already earned. ${
          loss > 0 ? `${loss.toLocaleString()} points will expire immediately for ${preview.usersAffected.toLocaleString()} patients. ` : preview.pointsRestored > 0 ? `${preview.pointsRestored.toLocaleString()} points will come back for ${preview.usersAffected.toLocaleString()} patients. ` : 'No patient loses points right now. '
        }${preview.expiringSoon30.points > 0 ? `${preview.expiringSoon30.points.toLocaleString()} points (${preview.expiringSoon30.users} patients) will expire within 30 days.` : ''}`
      : `Points will expire ${period} after they were earned — this applies to ALL points, including ones already earned.`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#fef3c7' }}>
          <Coins className="w-4.5 h-4.5" style={{ color: '#d97706' }} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Points Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Patient loyalty points — earn & redeem rates, and expiry</p>
        </div>
      </div>

      {loading ? (
        <div className="h-52 rounded-2xl bg-gray-100 animate-pulse" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-5 max-w-lg">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">Points System Active</p>
              <p className="text-xs text-gray-400 mt-0.5">Off ဆိုရင် ဝယ်ယူမှုများအတွက် Points ရမည် မဟုတ်ပါ</p>
            </div>
            <button onClick={() => setIsActive(v => !v)} className="shrink-0" aria-label="Toggle points system">
              {isActive
                ? <ToggleRight className="w-9 h-9" style={{ color: PRIMARY }} />
                : <ToggleLeft className="w-9 h-9 text-gray-300" />}
            </button>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Earn Rate</label>
            <p className="text-xs text-gray-400">ဝယ်ယူငွေ ဘယ်လောက်ကို 1 Point ရမလဲ</p>
            <div className="flex items-center gap-2 mt-1">
              <input type="number" min={1} value={kyatPerPointEarn} onChange={e => setKyatPerPointEarn(e.target.value)} className={inp} />
              <span className="text-sm text-gray-400">Ks = 1 Point</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Redeem Rate</label>
            <p className="text-xs text-gray-400">1 Point သုံးရင် ဘယ်လောက် လျှော့ပေးမလဲ — Online Doctor appointment တွင်သာ သုံးနိုင်ပြီး Coupon နှင့် တစ်ပြိုင်နက် မသုံးနိုင်ပါ</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-400">1 Point =</span>
              <input type="number" min={1} value={kyatPerPointRedeem} onChange={e => setKyatPerPointRedeem(e.target.value)} className={inp} />
              <span className="text-sm text-gray-400">Ks</span>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Hourglass className="w-4.5 h-4.5 mt-0.5 shrink-0" style={{ color: '#d97706' }} />
                <div>
                  <p className="text-sm font-bold text-gray-800">Points Expiry</p>
                  <p className="text-xs text-gray-400 mt-0.5">ရထားတဲ့ Points တွေ သတ်မှတ်ကာလကြာရင် သက်တမ်းကုန်မယ်။ အရင်ရတဲ့ Points ကို အရင်သုံးမယ်။</p>
                </div>
              </div>
              <button onClick={() => setExpiryEnabled(v => !v)} className="shrink-0" aria-label="Toggle points expiry">
                {expiryEnabled
                  ? <ToggleRight className="w-9 h-9" style={{ color: PRIMARY }} />
                  : <ToggleLeft className="w-9 h-9 text-gray-300" />}
              </button>
            </div>

            {expiryEnabled && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Expire after</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} max={maxValue} value={expiryValue} onChange={e => setExpiryValue(e.target.value)} className={`${inp} w-28`} />
                    <select value={expiryUnit} onChange={e => setExpiryUnit(e.target.value as Unit)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400">
                      <option value="MONTHS">months</option>
                      <option value="DAYS">days</option>
                    </select>
                    <span className="text-sm text-gray-400">after they are earned</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Applies to all points, including ones already earned. Change it any time — points that expired come back if you lengthen it.</p>
                </div>

                {valueOk && (
                  <div className="rounded-xl px-4 py-3 text-xs leading-relaxed"
                    style={{ backgroundColor: loss > 0 ? '#fef2f2' : '#f0fdfa', color: loss > 0 ? '#b91c1c' : '#0f766e' }}>
                    {!previewReady ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking the impact…</span>
                    ) : preview && (
                      <>
                        <p className="font-bold flex items-center gap-1.5">
                          {loss > 0 && <AlertTriangle className="w-3.5 h-3.5" />}
                          {loss > 0
                            ? `Saving this expires ${loss.toLocaleString()} points now (${preview.usersAffected.toLocaleString()} patients)`
                            : preview.pointsRestored > 0
                              ? `Saving this brings back ${preview.pointsRestored.toLocaleString()} points (${preview.usersAffected.toLocaleString()} patients)`
                              : 'Saving this doesn’t change anyone’s points right now'}
                        </p>
                        <p className="mt-0.5 opacity-80">
                          {preview.expiringSoon30.points > 0
                            ? `${preview.expiringSoon30.points.toLocaleString()} points (${preview.expiringSoon30.users} patients) would expire within the next 30 days.`
                            : 'No points would expire in the next 30 days.'}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center gap-3">
            <button onClick={onSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: PRIMARY }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            {saved && <span className="text-xs font-semibold text-green-600">Saved</span>}
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirming}
        title={expiryEnabled ? 'Save points expiry?' : 'Turn points expiry off?'}
        message={confirmMessage}
        confirmLabel="Save"
        variant={loss > 0 ? 'danger' : 'default'}
        loading={saving}
        onConfirm={save}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
