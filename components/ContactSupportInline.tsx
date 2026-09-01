'use client';

import { useState } from 'react';
import { Headset, Send, Check, Loader2 } from 'lucide-react';

const PRIMARY = '#0d2b6e';

/** Self-contained "message customer care" box for public landing pages that have no
 * patient session yet (SupportChatWidget assumes one). Auto-fills from localStorage if a
 * patient identity already exists; otherwise collects name+phone inline — the support API
 * creates the user record on first contact either way, same as booking/checkout do. */
export default function ContactSupportInline({ mm }: { mm: boolean }) {
  const stored = (() => {
    try {
      const raw = localStorage.getItem('medihug_patient');
      return raw ? (JSON.parse(raw) as { name: string; phone: string }) : null;
    } catch { return null; }
  })();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(stored?.name ?? '');
  const [phone, setPhone] = useState(stored?.phone ?? '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError(mm ? 'အမည်၊ ဖုန်းနံပါတ်၊ Message ဖြည့်ပေးပါ' : 'Please fill in name, phone, and message');
      return;
    }
    setError('');
    setSending(true);
    try {
      const res = await fetch('/api/patient/support', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), body: message.trim() }),
      });
      if (!res.ok) { setError(mm ? 'ပို့၍မရပါ၊ ပြန်စမ်းကြည့်ပါ' : 'Failed to send. Please try again.'); return; }
      if (!stored) localStorage.setItem('medihug_patient', JSON.stringify({ name: name.trim(), phone: phone.trim() }));
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-2 text-center px-6 py-5 rounded-2xl border border-gray-100 bg-white">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
          <Check className="w-5 h-5" style={{ color: '#16a34a' }} />
        </div>
        <p className="text-sm font-semibold text-gray-800">{mm ? 'ပို့ပြီးပါပြီ' : 'Message sent'}</p>
        <p className="text-xs text-gray-400">{mm ? 'ကျွန်ုပ်တို့ Team မှ မကြာမီ ပြန်လည် ဆက်သွယ်ပါမည်' : "Our team will get back to you shortly."}</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold text-white transition-transform active:scale-95"
        style={{ backgroundColor: PRIMARY }}>
        <Headset className="w-4 h-4" />
        {mm ? 'Customer Care ကို Message ပို့ရန်' : 'Message Customer Care'}
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm flex flex-col gap-2.5 px-5 py-5 rounded-2xl border border-gray-100 bg-white text-left">
      <div className="flex items-center gap-2 mb-1">
        <Headset className="w-4 h-4" style={{ color: PRIMARY }} />
        <p className="text-sm font-bold text-gray-800">{mm ? 'Customer Care' : 'Customer Care'}</p>
      </div>
      {!stored && (
        <div className="flex gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder={mm ? 'အမည်' : 'Name'}
            className="flex-1 min-w-0 text-sm text-gray-700 rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-gray-300" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="09xxxxxxxxx"
            className="flex-1 min-w-0 text-sm text-gray-700 rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-gray-300" />
        </div>
      )}
      <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
        placeholder={mm ? 'ဘာများ ကူညီပေးရမလဲ?' : 'How can we help?'}
        className="w-full text-sm text-gray-700 rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-gray-300 resize-none" />
      {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
      <button onClick={send} disabled={sending}
        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
        style={{ backgroundColor: PRIMARY }}>
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {mm ? 'ပို့မည်' : 'Send'}
      </button>
    </div>
  );
}
