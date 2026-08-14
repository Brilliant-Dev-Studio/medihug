'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Send, Video, Paperclip, FileText, Loader2 } from 'lucide-react';
import { uploadChatAttachment } from '@/lib/chatUpload';
import { useRealtime } from '@/components/RealtimeProvider';

const PRIMARY = 'var(--color-primary, #2ab5ad)';
const SAFETY_POLL_MS = 30000; // WebSocket push is primary; this just covers a missed reconnect gap

interface Message {
  id: string; sender: 'DOCTOR' | 'PATIENT'; body: string; createdAt: string;
  attachmentUrl?: string | null; attachmentName?: string | null; attachmentType?: string | null;
  pending?: boolean; failed?: boolean;
}

interface Props {
  appointmentId: string;
  role: 'doctor' | 'patient';
  phone?: string; // required when role === 'patient'
  peerName: string;
  peerAvatar?: string | null;
  open: boolean;
  onClose: () => void;
  onStartVideoCall?: () => void;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function Avatar({ name, src, className }: { name: string; src?: string | null; className: string }) {
  if (src) {
    return <img src={src} alt={name} className={`${className} object-cover`} />;
  }
  return (
    <div className={`${className} text-white font-bold flex items-center justify-center`} style={{ backgroundColor: PRIMARY }}>
      {initials(name || '?')}
    </div>
  );
}

/** Messenger-style centered chat modal, shared by doctor + patient appointment views. */
export default function AppointmentChatPanel({ appointmentId, role, phone, peerName, peerAvatar, open, onClose, onStartVideoCall }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mySender = role === 'doctor' ? 'DOCTOR' : 'PATIENT';
  const base = role === 'doctor' ? `/api/doctor/appointments/${appointmentId}/messages` : `/api/patient/appointments/${appointmentId}/messages`;
  const uploadEndpoint = `${base}/upload`;

  useEffect(() => {
    if (!open) return;
    if (role === 'patient' && !phone) return;

    let cancelled = false;
    async function poll() {
      if (document.hidden) return;
      try {
        const url = role === 'patient' ? `${base}?phone=${encodeURIComponent(phone!)}` : base;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setMessages(data.messages ?? []);
      } catch {} finally {
        if (!cancelled) setLoading(false);
      }
    }
    poll();
    const interval = setInterval(poll, SAFETY_POLL_MS);
    document.addEventListener('visibilitychange', poll);
    return () => { cancelled = true; clearInterval(interval); document.removeEventListener('visibilitychange', poll); };
  }, [open, role, phone, base]);

  const { subscribeChatMessages } = useRealtime();
  useEffect(() => {
    if (!open) return;
    return subscribeChatMessages(appointmentId, (incoming) => {
      const m = incoming as Message;
      setMessages(list => list.some(x => x.id === m.id) ? list : [...list, m]);
    });
  }, [open, appointmentId, subscribeChatMessages]);

  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  function pickFile() {
    fileInputRef.current?.click();
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError('');
    setPendingFile(file);
    setPendingPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
  }

  function clearPending() {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
  }

  async function send() {
    const body = draft.trim();
    const file = pendingFile;
    if ((!body && !file) || sending) return;
    if (role === 'patient' && !phone) return;

    setSending(true);
    setDraft('');
    const localPreview = pendingPreview;
    setPendingFile(null);
    setPendingPreview(null);
    setUploadError('');

    const tempId = `pending-${Date.now()}`;
    if (file) {
      setMessages(m => [...m, {
        id: tempId, sender: mySender, body, createdAt: new Date().toISOString(),
        attachmentUrl: localPreview ?? undefined, attachmentName: file.name, attachmentType: file.type,
        pending: true,
      }]);
    }

    try {
      let attachmentUrl: string | undefined, attachmentName: string | undefined, attachmentType: string | undefined;
      if (file) {
        const uploaded = await uploadChatAttachment(file, uploadEndpoint, role === 'patient' ? { phone: phone! } : {});
        attachmentUrl = uploaded.url; attachmentName = uploaded.name; attachmentType = uploaded.type;
      }
      const res = await fetch(base, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(role === 'patient' ? { phone } : {}),
          body, attachmentUrl, attachmentName, attachmentType,
        }),
      });
      let data: { message?: Message; error?: string } = {};
      try { data = await res.json(); } catch {}

      if (data.message) {
        setMessages(m => file ? m.map(msg => msg.id === tempId ? data.message! : msg) : [...m, data.message!]);
      } else {
        if (file) setMessages(m => m.map(msg => msg.id === tempId ? { ...msg, pending: false, failed: true } : msg));
        else setDraft(d => d || body);
        setUploadError(data.error ?? `Failed to send${res.ok ? '' : ` (server error ${res.status})`}`);
      }
    } catch (err) {
      if (file) setMessages(m => m.map(msg => msg.id === tempId ? { ...msg, pending: false, failed: true } : msg));
      else setDraft(d => d || body);
      setUploadError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      if (localPreview) URL.revokeObjectURL(localPreview);
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="w-90 max-w-[92vw] h-140 max-h-[80vh] bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 flex flex-col overflow-hidden animate-[fadeIn_.15s_ease-out]">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3 text-white shrink-0" style={{ backgroundColor: PRIMARY }}>
          <Avatar name={peerName} src={peerAvatar} className="w-10 h-10 rounded-full text-sm shrink-0 ring-2 ring-white/30 bg-white/20" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-tight truncate">{peerName}</p>
            <p className="text-[11px] text-white/75 leading-tight">Appointment chat</p>
          </div>
          {onStartVideoCall && (
            <button onClick={onStartVideoCall} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 shrink-0">
              <Video className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-3.5 py-4 flex flex-col gap-1 bg-gray-50">
          {loading ? (
            <p className="text-xs text-gray-400 text-center mt-8">Loading…</p>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center mt-10 gap-2 text-center">
              <Avatar name={peerName} src={peerAvatar} className="w-16 h-16 rounded-full text-lg" />
              <p className="text-sm font-semibold text-gray-700">{peerName}</p>
              <p className="text-xs text-gray-400">No messages yet — say hello 👋</p>
            </div>
          ) : (
            messages.map((m, i) => {
              const mine = m.sender === mySender;
              const prev = messages[i - 1];
              const next = messages[i + 1];
              const startGroup = !prev || prev.sender !== m.sender;
              const endGroup = !next || next.sender !== m.sender;
              return (
                <div key={m.id} className={`flex items-end gap-1.5 ${mine ? 'self-end' : 'self-start'} ${startGroup ? 'mt-2.5' : ''}`}>
                  {!mine && (
                    <Avatar name={peerName} src={peerAvatar} className={`w-6 h-6 rounded-full text-[9px] shrink-0 ${endGroup ? '' : 'invisible'}`} />
                  )}
                  <div className="flex flex-col max-w-64">
                    {m.attachmentUrl && m.attachmentType?.startsWith('image/') ? (
                      m.pending ? (
                        <div className="relative overflow-hidden rounded-2xl border border-gray-100">
                          <img src={m.attachmentUrl} alt={m.attachmentName ?? 'image'} className="max-w-full max-h-64 object-cover opacity-60" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        </div>
                      ) : (
                        <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl border border-gray-100">
                          <img src={m.attachmentUrl} alt={m.attachmentName ?? 'image'} className="max-w-full max-h-64 object-cover" />
                        </a>
                      )
                    ) : m.attachmentUrl ? (
                      <a
                        href={m.pending ? undefined : m.attachmentUrl} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-sm ${m.pending ? 'opacity-60' : ''} ${mine ? 'text-white' : 'bg-white border border-gray-100 text-gray-700'}`}
                        style={mine ? { backgroundColor: PRIMARY } : undefined}
                      >
                        {m.pending ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" /> : <FileText className="w-4 h-4 shrink-0" />}
                        <span className="truncate underline underline-offset-2">{m.attachmentName ?? 'file'}</span>
                      </a>
                    ) : null}
                    {m.failed && (
                      <span className="text-[10px] text-red-500 mt-0.5 px-1">Failed to send</span>
                    )}
                    {m.body && (
                      <div
                        className={`px-3.5 py-2 text-sm leading-snug whitespace-pre-wrap wrap-break-word ${m.attachmentUrl ? 'mt-1' : ''} ${mine ? 'text-white' : 'bg-white border border-gray-100 text-gray-700'} ${
                          mine
                            ? `rounded-2xl ${endGroup ? 'rounded-br-md' : 'rounded-br-2xl'}`
                            : `rounded-2xl ${endGroup ? 'rounded-bl-md' : 'rounded-bl-2xl'}`
                        }`}
                        style={mine ? { backgroundColor: PRIMARY } : undefined}
                      >
                        {m.body}
                      </div>
                    )}
                    {endGroup && (
                      <span className={`text-[10px] text-gray-400 mt-0.5 px-1 ${mine ? 'text-right' : 'text-left'}`}>{timeLabel(m.createdAt)}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Composer */}
        {uploadError && (
          <div className="px-3 py-1.5 text-[11px] text-red-500 bg-red-50 border-t border-red-100 shrink-0">{uploadError}</div>
        )}
        {pendingFile && (
          <div className="px-3 pt-2.5 border-t border-gray-100 shrink-0 bg-white">
            <div className="relative inline-flex items-center gap-2 bg-gray-100 rounded-xl p-1.5 pr-2.5 max-w-full">
              {pendingPreview ? (
                <img src={pendingPreview} alt={pendingFile.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <span className="text-xs text-gray-600 truncate max-w-40">{pendingFile.name}</span>
              <button onClick={clearPending} className="w-5 h-5 rounded-full bg-gray-700/80 hover:bg-gray-800 flex items-center justify-center text-white shrink-0 absolute -top-1.5 -left-1.5">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        <div className={`p-2.5 flex items-center gap-2 shrink-0 bg-white ${pendingFile ? '' : 'border-t border-gray-100'}`}>
          <input ref={fileInputRef} type="file" onChange={handleFilePick} className="hidden"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain" />
          <button onClick={pickFile} disabled={sending}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 shrink-0 disabled:opacity-40">
            <Paperclip className="w-4.5 h-4.5" />
          </button>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !sending && send()}
            placeholder="Aa"
            className="flex-1 bg-gray-100 border border-transparent rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#2ab5ad] focus:bg-white transition-colors"
          />
          <button onClick={send} disabled={sending || (!draft.trim() && !pendingFile)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 disabled:opacity-40 transition-transform active:scale-90"
            style={{ backgroundColor: PRIMARY }}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
