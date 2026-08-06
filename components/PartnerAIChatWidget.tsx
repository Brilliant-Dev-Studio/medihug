'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send } from 'lucide-react';

const PRIMARY = '#3b5bdb';

const SUGGESTIONS = [
  'List doctors under pediatrics',
  'What healthcare programs do we offer?',
  'Search products in the catalog',
  'Which clinics are partnered with us?',
];

interface Message { role: 'user' | 'assistant'; content: string; }

export default function PartnerAIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const accRef = useRef('');

  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  async function send(override?: string) {
    const body = (override ?? draft).trim().slice(0, 500);
    if (!body || sending) return;
    setDraft('');
    const nextMessages: Message[] = [...messages, { role: 'user', content: body }];
    setMessages([...nextMessages, { role: 'assistant', content: '' }]);
    setSending(true);

    try {
      const res = await fetch('/api/partner/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });
      if (!res.ok || !res.body) {
        const text = res.status === 429 ? await res.text().catch(() => '') : '';
        setMessages(m => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: text || 'Sorry, something went wrong. Please try again.' };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      accRef.current = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accRef.current += decoder.decode(value, { stream: true });
        setMessages(m => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: accRef.current };
          return copy;
        });
      }
    } catch {
      setMessages(m => {
        const copy = [...m];
        copy[copy.length - 1] = { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' };
        return copy;
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform"
        style={{ backgroundColor: PRIMARY }}
      >
        {open ? <X className="w-5 h-5" /> : <Bot className="w-6 h-6" strokeWidth={2} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[60vh] max-h-130 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            <div className="px-4 py-3.5 flex items-center gap-2.5 text-white shrink-0" style={{ backgroundColor: PRIMARY }}>
              <Bot className="w-4.5 h-4.5" />
              <div>
                <p className="text-sm font-bold leading-tight">MediHug Assistant</p>
                <p className="text-[11px] text-white/75 leading-tight">Ask about doctors & services</p>
              </div>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2 bg-gray-50">
              {messages.length === 0 && (
                <div className="mt-6 flex flex-col gap-3">
                  <p className="text-xs text-gray-400 text-center px-4">
                    Ask me about our doctors, specialties, clinics, products, or healthcare programs.
                  </p>
                  <div className="flex flex-col gap-2 px-1">
                    {SUGGESTIONS.map(q => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="text-left text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 hover:border-blue-300 hover:text-blue-600 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user' ? 'self-end text-white rounded-br-sm' : 'self-start bg-white border border-gray-100 text-gray-700 rounded-bl-sm'
                  }`}
                  style={m.role === 'user' ? { backgroundColor: PRIMARY } : undefined}
                >
                  {m.content || (sending && i === messages.length - 1 ? (
                    <span className="flex gap-1 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ) : '')}
                </div>
              ))}
            </div>

            <div className="p-2.5 border-t border-gray-100 flex items-center gap-2 shrink-0">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value.slice(0, 500))}
                onKeyDown={e => e.key === 'Enter' && !sending && send()}
                placeholder="Type a message..."
                maxLength={500}
                disabled={sending}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#3b5bdb] disabled:opacity-60"
              />
              <button onClick={() => send()} disabled={sending || !draft.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-40"
                style={{ backgroundColor: PRIMARY }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
