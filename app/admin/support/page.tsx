'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Headset, Send, Phone, Circle, ArrowLeft } from 'lucide-react';

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

  // Only ever show the thread that matches the selection — otherwise the previous conversation's
  // messages linger under the new name until the first poll returns.
  const current = detail && detail.id === selectedId ? detail : null;
  const openedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!current) return;
    // Jump straight to the latest message when a conversation is opened; smooth for new ones.
    const opened = openedIdRef.current !== current.id;
    openedIdRef.current = current.id;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: opened ? 'auto' : 'smooth' });
  }, [current?.id, current?.messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="h-[calc(100dvh-7rem)] md:h-[calc(100vh-140px)] min-h-[420px] rounded-2xl border border-gray-100 bg-white shadow-sm flex overflow-hidden">

      {/* Conversation list — the whole screen on phones until one is opened */}
      <div className={`${selectedId ? 'hidden md:flex' : 'flex'} w-full md:w-[300px] shrink-0 md:border-r border-gray-100 flex-col`}>
        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${PRIMARY}14` }}>
            <Headset className="w-4 h-4" style={{ color: PRIMARY }} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Customer Support</p>
            <p className="text-xs text-gray-400">{conversations.length} conversation(s)</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">
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
                className="relative w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-gray-50"
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

      {/* Thread — full screen on phones once a conversation is opened */}
      <div className={`${selectedId ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex-col bg-gray-50`}>
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Headset className="w-10 h-10 mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Select a conversation to view messages.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-3 md:px-5 py-3 md:py-3.5 bg-white border-b border-gray-100 flex items-center gap-2.5 md:gap-3 shrink-0">
              <button onClick={() => { setSelectedId(null); setDetail(null); }} aria-label="Back to conversations"
                className="md:hidden w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-gray-500 active:bg-gray-100 shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </button>
              {current ? (
                <>
                  {current.user.profileImage ? (
                    <Image src={current.user.profileImage} alt={current.user.name} width={36} height={36} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: PRIMARY }}>
                      {current.user.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-800 truncate">{current.user.name}</p>
                    <a href={`tel:${current.user.phone}`} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                      <Phone className="w-3 h-3" /> {current.user.phone}
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3.5 w-28 rounded bg-gray-100 animate-pulse" />
                    <div className="h-3 w-20 rounded bg-gray-100 animate-pulse" />
                  </div>
                </>
              )}
            </div>

            <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 md:px-5 py-4 flex flex-col gap-1">
              {!current ? (
                <div className="flex flex-col gap-3 pt-2" aria-busy="true">
                  <div className="h-10 w-2/3 rounded-2xl rounded-bl-sm bg-gray-200/70 animate-pulse" />
                  <div className="h-10 w-1/2 rounded-2xl rounded-br-sm bg-gray-200/70 animate-pulse self-end" />
                  <div className="h-14 w-3/4 rounded-2xl rounded-bl-sm bg-gray-200/70 animate-pulse" />
                </div>
              ) : current.messages.map((m, i) => {
                const prevSame = current.messages[i - 1]?.sender === m.sender;
                return (
                  <div key={m.id} className={`flex flex-col ${m.sender === 'ADMIN' ? 'items-end' : 'items-start'} ${prevSame ? 'mt-0.5' : 'mt-3'}`}>
                    <div className={`max-w-[85%] md:max-w-[65%] px-3.5 md:px-4 py-2.5 rounded-2xl text-sm leading-snug whitespace-pre-wrap [overflow-wrap:anywhere] ${m.sender === 'ADMIN' ? 'text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'}`}
                      style={m.sender === 'ADMIN' ? { backgroundColor: PRIMARY } : undefined}>
                      {m.body}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">{fmtTime(m.createdAt)}</span>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 md:p-3 bg-white border-t border-gray-100 flex items-center gap-2 md:gap-2.5 shrink-0">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !sending && send()}
                enterKeyHint="send"
                placeholder="Type a reply…"
                className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-base md:text-sm outline-none focus:border-[#2ab5ad] focus:ring-2 focus:ring-[#2ab5ad]/10 transition-all"
              />
              <button onClick={send} disabled={sending || !draft.trim()} aria-label="Send"
                className="w-11 h-11 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
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
