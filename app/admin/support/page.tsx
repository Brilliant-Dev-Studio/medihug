'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Headset, Send, Phone, Circle } from 'lucide-react';

const PRIMARY = '#2ab5ad';
const LIST_POLL_MS   = 5000;
const THREAD_POLL_MS = 3000;

interface ConvoListItem {
  id: string;
  lastMessageAt: string;
  unreadAdmin: boolean;
  user: { name: string; phone: string; profileImage: string | null };
  messages: { body: string; sender: 'PATIENT' | 'ADMIN'; createdAt: string }[];
}
interface Message { id: string; sender: 'PATIENT' | 'ADMIN'; body: string; createdAt: string; }
interface ConvoDetail {
  id: string;
  user: { name: string; phone: string; profileImage: string | null };
  messages: Message[];
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<ConvoListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConvoDetail | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      if (document.hidden) return;
      try {
        const res = await fetch('/api/admin/support');
        const data = await res.json();
        if (!cancelled) setConversations(data.conversations ?? []);
      } catch {}
    }
    poll();
    const interval = setInterval(poll, LIST_POLL_MS);
    document.addEventListener('visibilitychange', poll);
    return () => { cancelled = true; clearInterval(interval); document.removeEventListener('visibilitychange', poll); };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    async function poll() {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/admin/support/${selectedId}`);
        const data = await res.json();
        if (!cancelled) setDetail(data.conversation ?? null);
      } catch {}
    }
    poll();
    const interval = setInterval(poll, THREAD_POLL_MS);
    document.addEventListener('visibilitychange', poll);
    return () => { cancelled = true; clearInterval(interval); document.removeEventListener('visibilitychange', poll); };
  }, [selectedId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [detail?.messages.length]);

  async function send() {
    if (!selectedId || !draft.trim()) return;
    setSending(true);
    const body = draft.trim();
    setDraft('');
    try {
      const res = await fetch(`/api/admin/support/${selectedId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (data.message) setDetail(d => d ? { ...d, messages: [...d.messages, data.message] } : d);
      setConversations(cs => cs.map(c => c.id === selectedId ? { ...c, messages: [{ body, sender: 'ADMIN', createdAt: new Date().toISOString() }] } : c));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="h-[calc(100vh-140px)] min-h-[520px] rounded-2xl border border-gray-100 bg-white shadow-sm flex overflow-hidden">

      {/* Conversation list */}
      <div className="w-full sm:w-[300px] shrink-0 border-r border-gray-100 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}14` }}>
            <Headset className="w-4 h-4" style={{ color: PRIMARY }} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Customer Support</p>
            <p className="text-xs text-gray-400">{conversations.length} conversation(s)</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <Headset className="w-8 h-8 mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No conversations yet.</p>
            </div>
          ) : conversations.map(c => {
            const last = c.messages[0];
            const active = selectedId === c.id;
            return (
              <button key={c.id} onClick={() => setSelectedId(c.id)}
                className="relative w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                style={{ backgroundColor: active ? `${PRIMARY}0f` : 'transparent' }}
              >
                {active && <span className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: PRIMARY }} />}
                <div className="relative shrink-0">
                  {c.user.profileImage ? (
                    <Image src={c.user.profileImage} alt={c.user.name} width={44} height={44} className="w-11 h-11 rounded-full object-cover"
                      style={active ? { boxShadow: `0 0 0 2px ${PRIMARY}` } : undefined} />
                  ) : (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: PRIMARY, boxShadow: active ? `0 0 0 2px white, 0 0 0 4px ${PRIMARY}` : undefined }}>
                      {c.user.name.charAt(0)}
                    </div>
                  )}
                  {c.unreadAdmin && (
                    <Circle className="w-3 h-3 absolute -top-0.5 -right-0.5 fill-red-500 text-white stroke-white" strokeWidth={2} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${active || c.unreadAdmin ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{c.user.name}</p>
                    {last && <p className="text-[10px] text-gray-400 shrink-0">{fmtTime(last.createdAt)}</p>}
                  </div>
                  <p className={`text-xs truncate ${c.unreadAdmin ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                    {last ? `${last.sender === 'ADMIN' ? 'You: ' : ''}${last.body}` : c.user.phone}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Thread */}
      <div className="hidden sm:flex flex-1 min-w-0 flex-col bg-gray-50">
        {!selectedId || !detail ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Headset className="w-10 h-10 mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Select a conversation to view messages.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center gap-3 shrink-0">
              {detail.user.profileImage ? (
                <Image src={detail.user.profileImage} alt={detail.user.name} width={36} height={36} className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: PRIMARY }}>
                  {detail.user.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-gray-800">{detail.user.name}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Phone className="w-3 h-3" /> {detail.user.phone}
                </div>
              </div>
            </div>

            <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-1">
              {detail.messages.map((m, i) => {
                const prevSame = detail.messages[i - 1]?.sender === m.sender;
                return (
                  <div key={m.id} className={`flex flex-col ${m.sender === 'ADMIN' ? 'items-end' : 'items-start'} ${prevSame ? 'mt-0.5' : 'mt-3'}`}>
                    <div className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-snug ${m.sender === 'ADMIN' ? 'text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'}`}
                      style={m.sender === 'ADMIN' ? { backgroundColor: PRIMARY } : undefined}>
                      {m.body}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">{fmtTime(m.createdAt)}</span>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2.5 shrink-0">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !sending && send()}
                placeholder="Type a reply…"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2ab5ad] focus:ring-2 focus:ring-[#2ab5ad]/10 transition-all"
              />
              <button onClick={send} disabled={sending || !draft.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: PRIMARY }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
