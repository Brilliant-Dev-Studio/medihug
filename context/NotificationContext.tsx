'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import Knock from '@knocklabs/client';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

type PushStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported' | 'error';

interface NotificationContextValue {
  status: PushStatus;
  token: string | null;
  requestPushPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderProps {
  userId: string;
  userToken?: string;
  children: ReactNode;
}

export function NotificationProvider({ userId, userToken, children }: NotificationProviderProps) {
  const [status, setStatus] = useState<PushStatus>('idle');
  const [token, setToken]   = useState<string | null>(null);

  const requestPushPermission = useCallback(async () => {
    setStatus('requesting');

    if (typeof window === 'undefined' || !(await isSupported())) {
      setStatus('unsupported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      const firebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
      const messaging = getMessaging(firebaseApp);

      const fcmToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
        serviceWorkerRegistration: registration,
      });

      if (!fcmToken) {
        setStatus('error');
        return;
      }

      const knockClient = new Knock(process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY!);
      knockClient.authenticate(userId, userToken);

      await knockClient.user.setChannelData({
        channelId: process.env.NEXT_PUBLIC_KNOCK_FCM_CHANNEL_ID!,
        channelData: { tokens: [fcmToken] },
      });

      setToken(fcmToken);
      setStatus('granted');
    } catch (err) {
      console.error('Push registration failed:', err);
      setStatus('error');
    }
  }, [userId, userToken]);

  const value = useMemo(() => ({ status, token, requestPushPermission }), [status, token, requestPushPermission]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotificationPush() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationPush must be used within a NotificationProvider');
  return ctx;
}
