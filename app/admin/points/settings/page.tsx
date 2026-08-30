'use client';

import { useState, useEffect } from 'react';
import { Coins, Save, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';

const PRIMARY = '#2ab5ad';
const inp = 'w-40 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-400 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export default function PointsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [kyatPerPointEarn, setKyatPerPointEarn] = useState('1000');
  const [kyatPerPointRedeem, setKyatPerPointRedeem] = useState('1000');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetch('/api/admin/points-settings')
      .then(r => r.json())
      .then(d => {
        if (d.settings) {
          setKyatPerPointEarn(String(d.settings.kyatPerPointEarn));
          setKyatPerPointRedeem(String(d.settings.kyatPerPointRedeem));
          setIsActive(d.settings.isActive);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const earn = Number(kyatPerPointEarn);
    const redeem = Number(kyatPerPointRedeem);
    if (!Number.isFinite(earn) || earn <= 0 || !Number.isFinite(redeem) || redeem <= 0) {
      setError('တန်ဖိုးများ 0 ထက်ကြီးရပါမည်.');
      return;
    }
    setError(''); setSaving(true); setSaved(false);
    const res = await fetch('/api/admin/points-settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kyatPerPointEarn: earn, kyatPerPointRedeem: redeem, isActive }),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    else { const d = await res.json(); setError(d.error ?? 'Save failed'); }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#fef3c7' }}>
          <Coins className="w-4.5 h-4.5" style={{ color: '#d97706' }} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Points Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Patient loyalty points — earn & redeem rates</p>
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
            <button onClick={() => setIsActive(v => !v)} className="shrink-0">
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
            <p className="text-xs text-gray-400">1 Point သုံးရင် ဘယ်လောက် လျှော့ပေးမလဲ</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-400">1 Point =</span>
              <input type="number" min={1} value={kyatPerPointRedeem} onChange={e => setKyatPerPointRedeem(e.target.value)} className={inp} />
              <span className="text-sm text-gray-400">Ks</span>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center gap-3">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: PRIMARY }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            {saved && <span className="text-xs font-semibold text-green-600">Saved</span>}
          </div>
        </div>
      )}
    </div>
  );
}
