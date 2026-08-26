'use client';

import { useState } from 'react';
import { X, CalendarClock } from 'lucide-react';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

export default function CustomTimeRequestModal({ mm, defaultDateIso, onClose, onSubmit, submitting }: {
  mm: boolean;
  defaultDateIso: string;
  onClose: () => void;
  onSubmit: (data: { name: string; phone: string; date: string; time: string; note: string }) => void;
  submitting: boolean;
}) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [name, setName]     = useState('');
  const [phone, setPhone]   = useState('');
  const [date, setDate]     = useState(defaultDateIso.slice(0, 10));
  const [hour, setHour]     = useState('');
  const [minute, setMinute] = useState('');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [note, setNote]     = useState('');
  const [error, setError]   = useState('');

  function submit() {
    if (!name.trim() || !phone.trim() || !date || !hour || !minute) {
      setError(mm ? 'အမည်၊ ဖုန်းနံပါတ်၊ ရက်စွဲနှင့် အချိန် ဖြည့်ပေးရန် လိုအပ်ပါသည်' : 'Please fill in name, phone, date, and time');
      return;
    }
    let h24 = parseInt(hour, 10) % 12;
    if (period === 'PM') h24 += 12;
    const time = `${String(h24).padStart(2, '0')}:${minute}`;
    onSubmit({ name: name.trim(), phone: phone.trim(), date, time, note: note.trim() });
  }

  const selectCls = "flex-1 text-sm text-gray-700 rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-gray-300 transition-colors bg-white cursor-pointer";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#eff6ff' }}>
                <CalendarClock className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
              </div>
              <p className="text-sm font-bold text-gray-800">{mm ? 'အချိန် သီးသန့် တောင်းဆိုရန်' : 'Request a Different Time'}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-400 -mt-2">
            {mm
              ? 'သင်ကြိုက်နှစ်သက်ရာ ရက်စွဲနှင့် အချိန်ကို တောင်းဆိုပါ — Admin မှ ပြန်လည်ဆက်သွယ်ပါမည်။'
              : 'Ask for your preferred date and time — our team will review and get back to you.'}
          </p>

          <div className="flex flex-col gap-3">
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder={mm ? 'အမည်' : 'Name'}
              className="w-full text-sm text-gray-700 rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-gray-300 transition-colors" />
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="09xxxxxxxxx"
              className="w-full text-sm text-gray-700 rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-gray-300 transition-colors" />
            <input type="date" value={date} min={todayIso} onChange={e => setDate(e.target.value)}
              className="w-full text-sm text-gray-700 rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-gray-300 transition-colors cursor-pointer" />
            <div className="flex items-center gap-2">
              <select value={hour} onChange={e => setHour(e.target.value)} className={selectCls}>
                <option value="" disabled>{mm ? 'နာရီ' : 'Hour'}</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span className="text-gray-400 font-bold">:</span>
              <select value={minute} onChange={e => setMinute(e.target.value)} className={selectCls}>
                <option value="" disabled>{mm ? 'မိနစ်' : 'Min'}</option>
                {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select value={period} onChange={e => setPeriod(e.target.value as 'AM' | 'PM')} className={selectCls}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              placeholder={mm ? 'မှတ်ချက် (ရွေးချယ်ခွင့်)' : 'Note (optional)'}
              className="w-full text-sm text-gray-700 rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-gray-300 transition-colors resize-none" />
          </div>

          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

          <button onClick={submit} disabled={submitting}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
            {submitting ? (mm ? 'ပေးပို့နေသည်...' : 'Sending...') : (mm ? 'တောင်းဆိုမည်' : 'Send Request')}
          </button>
        </div>
      </div>
    </>
  );
}
