'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
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

export default function DoctorNotificationsPage() {
  const { notifications, unreadCount, loading, markAllRead } = useRealtime();

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4 lg:space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
            <Bell className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Notifications</h1>
            <p className="text-sm text-gray-500 mt-0.5">Updates on your appointments</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs font-semibold" style={{ color: PRIMARY }}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden min-h-[60vh]">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3.5 px-5 py-4">
                <div className="bg-gray-100 rounded-full animate-pulse w-9 h-9 shrink-0" />
                <div className="flex-1 flex flex-col gap-2 pt-0.5">
                  <div className="bg-gray-100 rounded-md animate-pulse h-3 w-3/4" />
                  <div className="bg-gray-100 rounded-md animate-pulse h-2.5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Bell size={48} strokeWidth={1.2} />
            <p className="mt-4 text-sm">No notifications yet.</p>
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
