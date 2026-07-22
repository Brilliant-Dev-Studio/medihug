'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import {
  KnockProvider,
  KnockFeedProvider,
  NotificationFeed,
  NotificationFeedContainer,
} from '@knocklabs/react';
import '@knocklabs/react/dist/index.css';

const PRIMARY = '#2ab5ad';

export default function DoctorNotificationsPage() {
  const [userId, setUserId]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/doctor/me').then(r => r.json()).then(d => {
      setUserId(d.doctor?.userId ?? null);
      setLoading(false);
    });
  }, []);

  const publicKey = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY;
  const feedId    = process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4 lg:space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
          <Bell className="w-4.5 h-4.5" style={{ color: PRIMARY }} />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Updates on your appointments</p>
        </div>
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
        ) : !userId || !publicKey || !feedId ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Bell size={48} strokeWidth={1.2} />
            <p className="mt-4 text-sm">Notifications are not available right now.</p>
          </div>
        ) : (
          <KnockProvider apiKey={publicKey} userId={userId}>
            <KnockFeedProvider feedId={feedId} colorMode="light">
              <NotificationFeedContainer>
                <NotificationFeed />
              </NotificationFeedContainer>
            </KnockFeedProvider>
          </KnockProvider>
        )}
      </div>
    </div>
  );
}
