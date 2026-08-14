'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  actionUrl: string | null;
  actorName: string | null;
  actorAvatar: string | null;
  read: boolean;
  createdAt: string;
}

interface ChatMessagePayload {
  appointmentId: string;
  message: unknown;
}

interface RealtimeContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  markAllRead: () => void;
  subscribeChatMessages: (appointmentId: string, cb: (message: unknown) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime must be used within a RealtimeProvider');
  return ctx;
}

/** Same appointmentId can be listened to by more than one open chat panel is not expected,
 * but keep a Set per id anyway for correctness (e.g. StrictMode double-mount in dev). */
type ChatListeners = Map<string, Set<(message: unknown) => void>>;

interface RealtimeProviderProps {
  role: 'admin' | 'doctor' | 'patient';
  phone?: string; // required when role === 'patient'
  children: ReactNode;
}

export function RealtimeProvider({ role, phone, children }: RealtimeProviderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const chatListenersRef = useRef<ChatListeners>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const restBase = `/api/${role}/notifications`;

  const fetchInitial = useCallback(() => {
    if (role === 'patient' && !phone) { setLoading(false); return; }
    const url = role === 'patient' ? `${restBase}?phone=${encodeURIComponent(phone!)}` : restBase;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        setNotifications(d.notifications ?? []);
        setUnreadCount(d.unreadCount ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role, phone, restBase]);

  useEffect(() => { fetchInitial(); }, [fetchInitial]);

  const markAllRead = useCallback(() => {
    setNotifications(list => list.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    fetch(restBase, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: role === 'patient' ? JSON.stringify({ phone }) : undefined,
    }).catch(() => {});
  }, [restBase, role, phone]);

  const subscribeChatMessages = useCallback((appointmentId: string, cb: (message: unknown) => void) => {
    const listeners = chatListenersRef.current;
    if (!listeners.has(appointmentId)) listeners.set(appointmentId, new Set());
    listeners.get(appointmentId)!.add(cb);
    return () => {
      const set = listeners.get(appointmentId);
      if (!set) return;
      set.delete(cb);
      if (set.size === 0) listeners.delete(appointmentId);
    };
  }, []);

  useEffect(() => {
    if (role === 'patient' && !phone) return;

    const audio = new Audio('/mixkit-happy-bells-notification-937.wav');
    audio.preload = 'auto';
    audioRef.current = audio;
    const unlock = () => {
      audio.muted = true;
      audio.play().then(() => { audio.pause(); audio.currentTime = 0; audio.muted = false; }).catch(() => {});
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    let cancelled = false;
    let delay = 1000;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    function connect() {
      if (cancelled) return;
      const proto = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      const ws = new WebSocket(`${proto}${window.location.host}/api/ws`);
      socketRef.current = ws;

      ws.addEventListener('open', () => {
        delay = 1000;
        if (role === 'patient' && phone) {
          ws.send(JSON.stringify({ type: 'auth', role: 'patient', phone }));
        }
      });

      ws.addEventListener('message', (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.kind === 'notification') {
            const n: NotificationItem = msg.notification;
            setNotifications(list => [n, ...list]);
            setUnreadCount(c => c + 1);
            const a = audioRef.current;
            if (a) { a.currentTime = 0; a.play().catch(() => {}); }
          } else if (msg.kind === 'chat-message') {
            const { appointmentId, message } = msg as ChatMessagePayload;
            chatListenersRef.current.get(appointmentId)?.forEach(cb => cb(message));
          }
        } catch {
          // ignore malformed frames
        }
      });

      ws.addEventListener('close', () => {
        if (cancelled) return;
        reconnectTimer = setTimeout(connect, delay);
        delay = Math.min(delay * 2, 30000);
      });
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      socketRef.current?.close();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [role, phone]);

  const value = useMemo(
    () => ({ notifications, unreadCount, loading, markAllRead, subscribeChatMessages }),
    [notifications, unreadCount, loading, markAllRead, subscribeChatMessages],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
