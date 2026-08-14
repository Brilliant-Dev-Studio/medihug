'use client';

import Link from 'next/link';
import { Bell, Loader2 } from 'lucide-react';
import { useRealtime, type NotificationItem } from '@/components/RealtimeProvider';

const PRIMARY = '#2ab5ad';

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function Row({ n }: { n: NotificationItem }) {
  const body = (
    <div className={`flex items-start gap-3.5 px-5 py-4 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-teal-50/30' : ''}`}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: PRIMARY }}>
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
        <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
      </div>
      {!n.read && <span className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ backgroundColor: PRIMARY }} />}
    </div>
  );
  return n.actionUrl ? <Link href={n.actionUrl} className="block">{body}</Link> : body;
}

export default function AdminNotificationsPage() {
  const { notifications, unreadCount, loading, markAllRead } = useRealtime();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
            <Bell className="w-7 h-7" style={{ color: PRIMARY }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
            <p className="text-base text-gray-500 mt-1">All activity and alerts for your account</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm font-semibold" style={{ color: PRIMARY }}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden min-h-[70vh]">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={32} className="animate-spin text-[#2ab5ad]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Bell size={56} strokeWidth={1.2} />
            <p className="mt-4 text-base">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(n => <Row key={n.id} n={n} />)}
          </div>
        )}
      </div>
    </div>
  );
}
