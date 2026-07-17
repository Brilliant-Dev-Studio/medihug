'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, AlertTriangle, Share2 } from 'lucide-react';
import type { IAgoraRTCClient, IMicrophoneAudioTrack, ICameraVideoTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';

const PRIMARY = 'var(--color-primary, #2ab5ad)';
const CALL_DURATION_SECONDS = 30 * 60;
const WARNING_AT_SECONDS = 2 * 60; // show the countdown once 2 minutes remain

interface Props {
  appointmentId: string;
  role: 'doctor' | 'patient' | 'guest';
  phone?: string; // required when role === 'patient'
  displayName: string;
  peerName: string;
  backHref: string;
  shareable?: boolean; // show a "Share" button that copies a guest join link (doctor/patient only)
}

function fmtCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VideoCallRoom({ appointmentId, role, phone, displayName, peerName, backHref, shareable }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [error, setError] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [peerJoined, setPeerJoined] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(CALL_DURATION_SECONDS);

  const localVideoRef  = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const videoTrackRef  = useRef<ICameraVideoTrack | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function join() {
      try {
        const qs = new URLSearchParams({ appointmentId, role });
        if (role === 'patient' && phone) qs.set('phone', phone);

        // Fetch the token and download the (large) SDK bundle at the same time instead of
        // sequentially — cuts real join latency since neither depends on the other.
        const [tokenRes, AgoraRTCModule] = await Promise.all([
          fetch(`/api/agora/token?${qs.toString()}`),
          import('agora-rtc-sdk-ng'),
        ]);
        const data = await tokenRes.json();
        if (!tokenRes.ok) throw new Error(data.error ?? 'Failed to get call token');
        if (cancelled) return;

        const AgoraRTC = AgoraRTCModule.default;
        AgoraRTC.setLogLevel(2); // WARNING — the default INFO level logs every frame/network stat and adds real overhead over a long call

        // H.264 decodes on hardware on almost all phones (unlike VP8, which is software-only
        // on most mobile browsers) — meaningfully lower CPU/battery use for a call that's
        // mostly on mobile devices.
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'h264' });
        clientRef.current = client;

        client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'video' && remoteVideoRef.current) {
            user.videoTrack?.play(remoteVideoRef.current);
            setPeerJoined(true);
          }
          if (mediaType === 'audio') user.audioTrack?.play();
        });
        client.on('user-unpublished', (_user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
          if (mediaType === 'video') setPeerJoined(false);
        });
        client.on('user-left', () => setPeerJoined(false));

        const [, [audioTrack, videoTrack]] = await Promise.all([
          client.join(data.appId, data.channel, data.token, data.uid),
          // 360p/15fps is plenty to see a patient's face/expressions clearly and is lighter
          // than the SDK's 480p default (500Kbps) — meaningfully more headroom on the
          // constrained mobile uplinks most callers here will be on.
          AgoraRTC.createMicrophoneAndCameraTracks(undefined, { encoderConfig: '360p_1' }),
        ]);
        if (cancelled) { audioTrack.close(); videoTrack.close(); await client.leave(); return; }
        audioTrackRef.current = audioTrack;
        videoTrackRef.current = videoTrack;
        if (localVideoRef.current) videoTrack.play(localVideoRef.current);
        await client.publish([audioTrack, videoTrack]);

        setStatus('connected');
      } catch (err) {
        console.error('Video call join failed:', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to join the call');
          setStatus('error');
        }
      }
    }

    join();

    return () => {
      cancelled = true;
      audioTrackRef.current?.close();
      videoTrackRef.current?.close();
      clientRef.current?.leave().catch(() => {});
    };
  }, [appointmentId, role, phone]);

  // Hard 30-minute cap on every call, starting once actually connected.
  useEffect(() => {
    if (status !== 'connected') return;
    const startedAt = Date.now();
    const tick = () => {
      const left = CALL_DURATION_SECONDS - Math.floor((Date.now() - startedAt) / 1000);
      setSecondsLeft(Math.max(0, left));
      if (left <= 0) {
        clearInterval(interval);
        toast.error('Call ended — 30 minute limit reached');
        router.push(backHref);
      }
    };
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [status, router, backHref]);

  const toggleMic = () => {
    audioTrackRef.current?.setEnabled(!micOn);
    setMicOn(v => !v);
  };
  const toggleCam = () => {
    videoTrackRef.current?.setEnabled(!camOn);
    setCamOn(v => !v);
  };
  const endCall = () => {
    router.push(backHref);
  };
  const shareLink = async () => {
    const url = `${window.location.origin}/call/${appointmentId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Join my MediHug video call', url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Call link copied — share it with someone else to join');
      }
    } catch {
      // user cancelled the native share sheet — not an error
    }
  };

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="text-white font-semibold">{error}</p>
        <button onClick={() => router.push(backHref)} className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white" style={{ backgroundColor: PRIMARY }}>
          Back to Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col relative overflow-hidden">
      {/* Remote video (full screen) */}
      <div ref={remoteVideoRef} className="absolute inset-0 bg-gray-900 flex items-center justify-center">
        {!peerJoined && (
          <div className="flex flex-col items-center gap-3 text-white/60">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold">
              {peerName.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm">Waiting for {peerName} to join…</p>
          </div>
        )}
      </div>

      {status === 'connecting' && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 z-20">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <p className="text-white text-sm font-semibold">Connecting…</p>
        </div>
      )}

      {/* Local video (PiP) */}
      <div ref={localVideoRef} className="absolute top-4 right-4 w-28 h-40 sm:w-36 sm:h-52 rounded-2xl overflow-hidden bg-gray-800 border-2 border-white/20 shadow-lg z-10">
        {!camOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <span className="text-white/60 text-xs font-semibold">{displayName.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Top bar */}
      <div className="relative z-10 px-5 py-4 flex items-start justify-between">
        <div>
          <p className="text-white font-bold text-sm">{peerName}</p>
          <p className="text-white/60 text-xs">{status === 'connected' ? (peerJoined ? 'In call' : 'Waiting…') : 'Connecting…'}</p>
        </div>
        {status === 'connected' && secondsLeft <= WARNING_AT_SECONDS && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: secondsLeft <= 30 ? '#ef4444' : '#f59e0b' }}>
            {fmtCountdown(secondsLeft)}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-10 mt-auto pb-8 pt-4 flex items-center justify-center gap-4">
        <button onClick={toggleMic}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: micOn ? 'rgba(255,255,255,0.15)' : '#ef4444' }}>
          {micOn ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
        </button>
        <button onClick={endCall}
          className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors">
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
        <button onClick={toggleCam}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: camOn ? 'rgba(255,255,255,0.15)' : '#ef4444' }}>
          {camOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
        </button>
        {shareable && (
          <button onClick={shareLink}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <Share2 className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
