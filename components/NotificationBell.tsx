'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useRealtime, type NotificationItem } from '@/components/RealtimeProvider';

const PRIMARY = 'var(--color-primary, #2ab5ad)';

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function NotificationRow({ n, onClick }: { n: NotificationItem; onClick: () => void }) {
  const body = (
    <div className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-teal-50/40' : ''}`}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ backgroundColor: PRIMARY }}>
        {n.actorAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={n.actorAvatar} alt={n.actorName ?? ''} className="w-full h-full rounded-full object-cover" />
        ) : (
          initials(n.actorName || n.title || '?')
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-700 leading-snug">
          <span className="font-semibold">{n.title}</span>{n.body ? ` ${n.body}` : ''}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
      </div>
      {!n.read && <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: PRIMARY }} />}
    </div>
  );

  if (n.actionUrl) {
    return <Link href={n.actionUrl} onClick={onClick} className="block">{body}</Link>;
  }
  return <div onClick={onClick} className="cursor-pointer">{body}</div>;
}

/** Bell icon + popover. Safe to render more than once (e.g. mobile + desktop headers) inside a
 * single RealtimeProvider — it only reads the shared notification state, it doesn't create it. */
export function NotificationBellButton() {
  const { notifications, unreadCount, loading, markAllRead } = useRealtime();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button onClick={() => setOpen(v => !v)} className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
        <Bell className="w-4.5 h-4.5 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-semibold" style={{ color: PRIMARY }}>
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-10">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-10">No notifications yet.</p>
            ) : (
              notifications.map(n => <NotificationRow key={n.id} n={n} onClick={() => setOpen(false)} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
