'use client';

import { useEffect, useRef, useState } from 'react';
import {
  KnockProvider,
  KnockFeedProvider,
  NotificationIconButton,
  NotificationFeedPopover,
  useKnockFeed,
} from '@knocklabs/react';
import '@knocklabs/react/dist/index.css';

interface NotificationBellProps {
  userId: string;
  userToken?: string;
}

function BellInner() {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { feedClient } = useKnockFeed();

  useEffect(() => {
    const playSound = () => {
      const audio = new Audio('/mixkit-happy-bells-notification-937.wav');
      audio.play().catch(() => {});
    };
    feedClient.on('items.received.realtime', playSound);
    return () => feedClient.off('items.received.realtime', playSound);
  }, [feedClient]);

  return (
    <div className="relative">
      <NotificationIconButton
        ref={buttonRef}
        onClick={() => setIsVisible((v) => !v)}
      />
      <NotificationFeedPopover
        buttonRef={buttonRef}
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
      />
    </div>
  );
}

export default function NotificationBell({ userId, userToken }: NotificationBellProps) {
  const publicKey = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY;
  const feedId = process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID;

  if (!publicKey || !feedId) return null;

  return (
    <KnockProvider apiKey={publicKey} userId={userId} userToken={userToken}>
      <KnockFeedProvider feedId={feedId} colorMode="light">
        <BellInner />
      </KnockFeedProvider>
    </KnockProvider>
  );
}
