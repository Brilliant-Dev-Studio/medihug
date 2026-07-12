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

interface NotificationBellProviderProps {
  userId: string;
  userToken?: string;
  children: React.ReactNode;
}

/**
 * Mounts the Knock feed client + realtime sound listener exactly once.
 * Wrap this around the whole header region (not each individual bell button) —
 * mounting it per-button would open a duplicate feed connection and play the
 * notification sound twice for a single incoming notification.
 */
export function NotificationBellProvider({ userId, userToken, children }: NotificationBellProviderProps) {
  const publicKey = process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY;
  const feedId = process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID;

  if (!publicKey || !feedId) return <>{children}</>;

  return (
    <KnockProvider apiKey={publicKey} userId={userId} userToken={userToken}>
      <KnockFeedProvider feedId={feedId} colorMode="light">
        <SoundOnReceive />
        {children}
      </KnockFeedProvider>
    </KnockProvider>
  );
}

function SoundOnReceive() {
  const { feedClient } = useKnockFeed();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/mixkit-happy-bells-notification-937.wav');
    audio.preload = 'auto';
    audioRef.current = audio;

    // Browsers block audio.play() until the user has interacted with the page at least
    // once. Prime the element on the first click/keypress so later realtime plays succeed.
    const unlock = () => {
      audio.muted = true;
      audio.play().then(() => { audio.pause(); audio.currentTime = 0; audio.muted = false; }).catch(() => {});
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    const playSound = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };
    feedClient.on('items.received.realtime', playSound);
    return () => feedClient.off('items.received.realtime', playSound);
  }, [feedClient]);

  return null;
}

/** The bell icon + popover UI. Safe to render more than once (e.g. mobile + desktop headers) as long as it's inside a single NotificationBellProvider — it only consumes the shared feed client, it doesn't create one. */
export function NotificationBellButton() {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

interface NotificationBellProps {
  userId: string;
  userToken?: string;
}

/** Convenience component for pages that only need a single bell instance (one provider + one button). */
export default function NotificationBell({ userId, userToken }: NotificationBellProps) {
  return (
    <NotificationBellProvider userId={userId} userToken={userToken}>
      <NotificationBellButton />
    </NotificationBellProvider>
  );
}
