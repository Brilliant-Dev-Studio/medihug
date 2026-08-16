'use client';

import { use } from 'react';
import VideoCallRoom from '@/components/VideoCallRoom';

/** Moderator's call-join entry point. No appointment-record fetch here on purpose —
 * moderating doesn't need patient details, just the call itself; the token endpoint
 * already validates the appointment exists and is CONFIRMED + approved. */
export default function ModerateCallPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = use(params);

  return (
    <VideoCallRoom
      appointmentId={appointmentId}
      role="moderator"
      displayName="Moderator"
      peerName="Call Participants"
      backHref="/admin/moderate"
    />
  );
}
