'use client';

import { Bell, BellRing, BellOff, Loader2 } from 'lucide-react';
import { useNotificationPush } from '@/context/NotificationContext';

export default function PushPermissionButton() {
  const { status, requestPushPermission } = useNotificationPush();

  if (status === 'granted') {
    return (
      <div title="Push notifications enabled" className="w-9 h-9 rounded-xl border border-teal-100 bg-teal-50 flex items-center justify-center text-teal-600">
        <BellRing className="w-4 h-4" />
      </div>
    );
  }

  if (status === 'denied' || status === 'unsupported') {
    return (
      <div title={status === 'denied' ? 'Push notifications blocked in browser settings' : 'Push notifications not supported on this browser'}
        className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300">
        <BellOff className="w-4 h-4" />
      </div>
    );
  }

  return (
    <button
      onClick={requestPushPermission}
      disabled={status === 'requesting'}
      title="Enable push notifications"
      className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-teal-50 hover:text-teal-600 hover:border-teal-100 flex items-center justify-center text-gray-500 transition-colors disabled:opacity-50"
    >
      {status === 'requesting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
    </button>
  );
}
