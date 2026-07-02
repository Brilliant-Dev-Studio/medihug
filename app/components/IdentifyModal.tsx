'use client';

import { useState } from 'react';
import { X, Heart } from 'lucide-react';

const PRIMARY   = 'var(--color-primary)';
const SECONDARY = 'var(--color-primary-dark)';

export default function IdentifyModal({ mm, onClose, onSubmit }: {
  mm: boolean; onClose: () => void; onSubmit: (name: string, phone: string) => void;
}) {
  const [name, setName]   = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  function submit() {
    if (!name.trim() || !phone.trim()) {
      setError(mm ? 'အမည်နှင့် ဖုန်းနံပါတ် ဖြည့်ပေးရန် လိုအပ်ပါသည်' : 'Please enter your name and phone number');
      return;
    }
    onSubmit(name.trim(), phone.trim());
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#fee2e2' }}>
                <Heart className="w-4.5 h-4.5" style={{ color: '#ef4444' }} fill="#ef4444" />
              </div>
              <p className="text-sm font-bold text-gray-800">{mm ? 'Favourite ထားရန်' : 'Save to Favourites'}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-400 -mt-2">
            {mm ? 'သင့်ရဲ့ favourite များကို သိမ်းဆည်းနိုင်ရန် အမည်နှင့် ဖုန်းနံပါတ် လိုအပ်ပါသည်' : 'We need your name and phone to save your favourites.'}
          </p>

          <div className="flex flex-col gap-3">
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder={mm ? 'အမည်' : 'Name'}
              className="w-full text-sm text-gray-700 rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-gray-300 transition-colors" />
            <input value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="09xxxxxxxxx"
              className="w-full text-sm text-gray-700 rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-gray-300 transition-colors" />
          </div>

          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

          <button onClick={submit}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)` }}>
            {mm ? 'ဆက်လက်လုပ်ဆောင်မည်' : 'Continue'}
          </button>
        </div>
      </div>
    </>
  );
}
