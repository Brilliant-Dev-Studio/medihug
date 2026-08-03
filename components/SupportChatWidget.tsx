'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Headset } from 'lucide-react';

const PRIMARY = 'var(--color-primary, #2ab5ad)';
const POLL_OPEN_MS   = 3000;
const POLL_CLOSED_MS = 10000;

interface Message { id: string; sender: 'PATIENT' | 'ADMIN'; body: string; createdAt: string; }

export default function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unread, setUnread] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  function getPatient(): { name: string; phone: string } | null {
    const raw = localStorage.getItem('medihug_patient');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  useEffect(() => {
    const patient = getPatient();
    if (!patient) return;

    let cancelled = false;
    async function poll() {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/patient/support?phone=${encodeURIComponent(patient!.phone)}${open ? '&markRead=1' : ''}`);
        const data = await res.json();
        if (cancelled) return;
        setMessages(data.messages ?? []);
        setUnread(!!data.unreadPatient);
      } catch {}
    }
    poll();
    const interval = setInterval(poll, open ? POLL_OPEN_MS : POLL_CLOSED_MS);
    document.addEventListener('visibilitychange', poll);
    return () => { cancelled = true; clearInterval(interval); document.removeEventListener('visibilitychange', poll); };
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  async function send() {
    const patient = getPatient();
    if (!patient || !draft.trim()) return;
    setSending(true);
    const body = draft.trim();
    setDraft('');
    try {
      const res = await fetch('/api/patient/support', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: patient.phone, name: patient.name, body }),
      });
      const data = await res.json();
      if (data.message) setMessages(m => [...m, data.message]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-40 lg:bottom-6 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform"
        style={{ backgroundColor: PRIMARY }}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && unread && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-56 lg:bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[55vh] max-h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="px-4 py-3.5 flex items-center gap-2.5 text-white shrink-0" style={{ backgroundColor: PRIMARY }}>
            <Headset className="w-4.5 h-4.5" />
            <div>
              <p className="text-sm font-bold leading-tight">Customer Support</p>
              <p className="text-[11px] text-white/70 leading-tight">MediHug Team</p>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2 bg-gray-50">
            {messages.length === 0 && (
              <p className="text-xs text-gray-400 text-center mt-8">ဘာများ ကူညီပေးရမလဲ? မက်ဆေ့ချ်ပို့ပါ။</p>
            )}
            {messages.map(m => (
              <div key={m.id} className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-snug ${m.sender === 'PATIENT' ? 'self-end text-white rounded-br-sm' : 'self-start bg-white border border-gray-100 text-gray-700 rounded-bl-sm'}`}
                style={m.sender === 'PATIENT' ? { backgroundColor: PRIMARY } : undefined}>
                {m.body}
              </div>
            ))}
          </div>

          <div className="p-2.5 border-t border-gray-100 flex items-center gap-2 shrink-0">
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !sending && send()}
              placeholder="Message ရိုက်ပါ..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#2ab5ad]"
            />
            <button onClick={send} disabled={sending || !draft.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-40"
              style={{ backgroundColor: PRIMARY }}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
