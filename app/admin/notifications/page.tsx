'use client';

import { useEffect, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import {
  KnockProvider,
  KnockFeedProvider,
  NotificationFeed,
  NotificationFeedContainer,
} from '@knocklabs/react';
import '@knocklabs/react/dist/index.css';

const PRIMARY = '#2ab5ad';

export default function AdminNotificationsPage() {
  const [adminId, setAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/me').then(r => r.json()).then(d => {
      setAdminId(d.admin?.id ?? null);
      setLoading(false);
    });
  }, []);

  const publicKey = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY;
  const feedId    = process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#e6f7f7' }}>
          <Bell className="w-7 h-7" style={{ color: PRIMARY }} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-base text-gray-500 mt-1">All activity and alerts for your account</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_28px_-18px_rgba(0,0,0,0.12)] overflow-hidden min-h-[70vh] [&_.knock-feed-provider]:text-base">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={32} className="animate-spin text-[#2ab5ad]" />
          </div>
        ) : !adminId || !publicKey || !feedId ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Bell size={56} strokeWidth={1.2} />
            <p className="mt-4 text-base">Notifications are not available right now.</p>
          </div>
        ) : (
          <KnockProvider apiKey={publicKey} userId={adminId}>
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
