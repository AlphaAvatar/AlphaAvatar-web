// components/livekit/demo-client.tsx
// LiveKit not connected:
// - Connecting / Demo disconnected in the top right corner
// Unable to connect after 9 seconds
// LiveKit connected, but AlphaAvatar agent not started:
// - Waiting for AlphaAvatar agent... in the top right corner
// - Input box disabled
// Agent is not available after 9 seconds
// - Mic / Camera can still be opened, allowing users to authorize in advance
// Agent added:
// - Realtime AI Avatar Demo in the top right corner
// - Input box available
// - Mic / Camera available
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RoomAudioRenderer,
  useAgent,
  useSessionContext,
  useSessionMessages,
} from "@livekit/components-react";
import type {
  LocalParticipant,
  RemoteParticipant,
  Room,
} from "livekit-client";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
};

type DemoToast = {
  id: number;
  type: "error" | "info";
  message: string;
};

const BARS = 11;

function AlphaLogo() {
  return (
    <div className="flex items-center gap-3.5">
      <div className="relative flex h-11 w-11 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-violet-500/20 blur-xl" />

        <svg
          viewBox="0 0 48 48"
          className="relative h-10 w-10 drop-shadow-[0_0_18px_rgba(139,92,246,0.45)]"
          fill="none"
        >
          <defs>
            <linearGradient
              id="alpha-logo-gradient"
              x1="8"
              y1="6"
              x2="40"
              y2="42"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#C4B5FD" />
              <stop offset="48%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
          </defs>

          <path
            d="M24 6.5L41 39L27.4 31.8L24 39.3L20.6 31.8L7 39L24 6.5Z"
            stroke="url(#alpha-logo-gradient)"
            strokeWidth="4.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M24 16.5L31.5 31.2L26.5 28.6L24 34L21.5 28.6L16.5 31.2L24 16.5Z"
            stroke="url(#alpha-logo-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
          />
        </svg>
      </div>

      <div className="text-[23px] font-semibold tracking-[-0.03em] text-white">
        AlphaAvatar
      </div>
    </div>
  );
}

function ConnectionNotice({
  visible,
  state,
  reason = "connection",
}: {
  visible: boolean;
  state: string;
  reason?: "connection" | "agent";
}) {
  if (!visible) return null;

  const title =
    reason === "agent"
      ? "AlphaAvatar agent is not available"
      : "Unable to connect to AlphaAvatar";

  const message =
    reason === "agent"
      ? "The web client is connected, but the AlphaAvatar agent has not joined this room yet. The demo may still be starting up. Please try again later."
      : "The realtime demo is temporarily unavailable. Please try again later.";

  return (
    <div className="absolute left-1/2 top-[108px] z-50 w-[calc(100%-44px)] max-w-[620px] -translate-x-1/2">
      <div className="rounded-[18px] border border-red-400/25 bg-red-950/45 px-5 py-4 text-center shadow-[0_20px_80px_rgba(185,28,28,0.22)] backdrop-blur-xl">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-red-100">
          <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.8)]" />
          {title}
        </div>

        <p className="mt-2 text-sm leading-6 text-red-100/70">
          {message}
        </p>

        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Retry
          </button>

          <span className="text-xs text-white/35">
            State: {state || "disconnected"}
          </span>
        </div>
      </div>
    </div>
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

function getConnectionStatus(state: string) {
  switch (state) {
    case "connected":
      return {
        label: "Realtime AI Avatar Demo",
        dotClass:
          "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]",
      };

    case "connecting":
      return {
        label: "Connecting to demo...",
        dotClass:
          "bg-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.75)]",
      };

    case "reconnecting":
      return {
        label: "Reconnecting...",
        dotClass:
          "bg-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.75)]",
      };

    case "disconnected":
      return {
        label: "Demo disconnected",
        dotClass: "bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.75)]",
      };

    default:
      return {
        label: "Preparing demo...",
        dotClass:
          "bg-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.75)]",
      };
  }
}

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: DemoToast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="absolute right-6 top-[108px] z-50 flex w-[360px] max-w-[calc(100%-48px)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-[16px] border px-4 py-3 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl ${
            toast.type === "error"
              ? "border-red-400/25 bg-red-950/50 text-red-100"
              : "border-violet-400/25 bg-[#070812]/90 text-white"
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                toast.type === "error"
                  ? "bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.8)]"
                  : "bg-violet-400 shadow-[0_0_14px_rgba(139,92,246,0.8)]"
              }`}
            />

            <p className="flex-1 text-sm leading-6 text-white/80">
              {toast.message}
            </p>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/40 transition hover:text-white"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EndedOverlay({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/35 backdrop-blur-[2px]">
      <div className="w-[420px] max-w-[calc(100%-48px)] rounded-[22px] border border-white/10 bg-[#070812]/90 px-6 py-6 text-center shadow-[0_24px_100px_rgba(0,0,0,0.55)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/25 bg-violet-500/15 text-violet-200">
          <IconPhoneOff />
        </div>

        <div className="text-lg font-semibold text-white">Call ended</div>

        <p className="mt-2 text-sm leading-6 text-white/55">
          The current demo session has ended. Start a new session to continue
          talking with AlphaAvatar.
        </p>

        <button
          onClick={onRestart}
          className="mt-5 rounded-[14px] bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:opacity-90"
        >
          Start Again
        </button>
      </div>
    </div>
  );
}

function IconMic() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 0 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h8A2.5 2.5 0 0 1 17 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-8A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="m17 10 4-2.5v9L17 14"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconScreen() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4 5h16v11H4V5Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="M9 20h6M12 16v4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H10l-4.5 4v-4A2.5 2.5 0 0 1 3 12.5v-6Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="M8 8h8M8 11h5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="M19.4 15a8 8 0 0 0 .1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1L15 6.5h-4L10.6 9a7 7 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a8 8 0 0 0 .1 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2.2-1.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSend() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="m21 3-9.2 18-2.2-7.6L3 10.8 21 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m10 14 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPhoneOff() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M6.5 14.5c3.4-2.6 7.6-2.6 11 0l1.1.9a2 2 0 0 1 .3 2.8l-.8 1a2 2 0 0 1-2.4.5l-2.2-1a4 4 0 0 0-3 0l-2.2 1a2 2 0 0 1-2.4-.5l-.8-1a2 2 0 0 1 .3-2.8l1.1-.9Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function useRoomRefresh(room: Room | undefined) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!room) return;

    const bump = () => setVersion((v) => v + 1);

    const events = [
      "connectionStateChanged",
      "participantConnected",
      "participantDisconnected",
      "trackPublished",
      "trackUnpublished",
      "trackSubscribed",
      "trackUnsubscribed",
      "localTrackPublished",
      "localTrackUnpublished",
      "mediaDevicesChanged",
      "activeSpeakersChanged",
      "trackMuted",
      "trackUnmuted",
    ];

    events.forEach((event) => room.on(event as any, bump));
    bump();

    return () => {
      events.forEach((event) => room.off(event as any, bump));
    };
  }, [room]);

  return version;
}

function getAgentParticipant(room: Room | undefined) {
  if (!room) return undefined;

  const remoteParticipants = Array.from(room.remoteParticipants.values());

  return (
    remoteParticipants.find((p: any) => {
      const identity = String(p?.identity ?? "").toLowerCase();
      const kind = String(p?.kind ?? "").toLowerCase();

      return (
        p?.isAgent === true ||
        kind === "agent" ||
        identity.includes("agent") ||
        identity.includes("assistant") ||
        identity.includes("alphaavatar") ||
        identity.includes("avatar")
      );
    }) ?? remoteParticipants[0]
  );
}

function useAgentAvailability(room: Room | undefined) {
  const version = useRoomRefresh(room);

  const agentParticipant = useMemo(() => {
    return getAgentParticipant(room);
  }, [room, version]);

  const remoteCount = room?.remoteParticipants.size ?? 0;

  return {
    agentParticipant,
    hasAgent: Boolean(agentParticipant),
    remoteCount,
  };
}

function useParticipantVideoTrack(
  participant: LocalParticipant | RemoteParticipant | undefined,
  version: number
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const publication = useMemo(() => {
    if (!participant) return undefined;

    return Array.from(participant.videoTrackPublications.values()).find(
      (pub) => pub.track && !pub.isMuted
    );
  }, [participant, version]);

  useEffect(() => {
    const el = videoRef.current;
    const track = publication?.track as any;

    if (!el || !track?.mediaStreamTrack) return;

    const stream = new MediaStream([track.mediaStreamTrack]);
    el.srcObject = stream;

    void el.play().catch((err) => {
      console.warn("[AlphaAvatar] video play failed:", err);
    });

    return () => {
      if (el.srcObject === stream) {
        el.srcObject = null;
      }
    };
  }, [publication, version]);

  return {
    videoRef,
    hasVideo: Boolean(publication?.track && !publication?.isMuted),
  };
}

function useAgentAudioLevels(
  participant: RemoteParticipant | undefined,
  version: number
) {
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: BARS }, () => 0.25)
  );

  useEffect(() => {
    const publication = participant
      ? Array.from(participant.audioTrackPublications.values()).find(
          (pub) => pub.track && !pub.isMuted
        )
      : undefined;

    const mediaTrack = (publication?.track as any)?.mediaStreamTrack as
      | MediaStreamTrack
      | undefined;

    if (!mediaTrack) {
      setLevels(Array.from({ length: BARS }, () => 0.18));
      return;
    }

    let disposed = false;
    let raf = 0;
    let lastUpdate = 0;

    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.72;

    const stream = new MediaStream([mediaTrack]);
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);

    void audioContext.resume().catch(() => {
      // Browser may wait until user gesture. RoomAudioRenderer still plays audio.
    });

    const tick = (now: number) => {
      if (disposed) return;

      analyser.getByteFrequencyData(data);

      if (now - lastUpdate > 40) {
        lastUpdate = now;

        const next = Array.from({ length: BARS }, (_, i) => {
          const start = Math.floor((i / BARS) * data.length * 0.68);
          const end = Math.floor(((i + 1) / BARS) * data.length * 0.68);
          const slice = data.slice(start, Math.max(start + 1, end));
          const avg =
            slice.reduce((sum, value) => sum + value, 0) / slice.length / 255;

          const centerBoost = 1 - Math.abs(i - Math.floor(BARS / 2)) / BARS;
          const shaped = Math.min(1, avg * 2.2 + centerBoost * 0.08);

          return Math.max(0.12, shaped);
        });

        setLevels(next);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      source.disconnect();
      analyser.disconnect();
      void audioContext.close().catch(() => {});
    };
  }, [participant, version]);

  return levels;
}

function SpeakingCard({
  agentState,
  level,
}: {
  agentState: string;
  level: number;
}) {
  const isSpeaking = agentState === "speaking" || level > 0.2;

  return (
    <div className="absolute left-6 top-6 z-20 w-[300px] rounded-[16px] border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="text-[17px] text-violet-300">✦</div>

        <div className="text-[16px] font-semibold text-violet-300">
          {isSpeaking ? "Alpha is speaking..." : "Alpha is listening..."}
        </div>

        <div className="ml-auto flex h-4 items-end gap-[3px]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-indigo-400 transition-all duration-100"
              style={{
                height: `${6 + Math.max(level, 0.12) * 14 * ((i + 1) / 4)}px`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-2 text-[14px] text-white/55">
        Listening and responding in real time
      </div>
    </div>
  );
}

function VoiceOrb({
  levels,
  hasAgentVideo,
}: {
  levels: number[];
  hasAgentVideo: boolean;
}) {
  const avg = levels.reduce((sum, v) => sum + v, 0) / levels.length;

  if (hasAgentVideo) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="pointer-events-none absolute h-[700px] w-[700px] rounded-full border border-white/[0.055]" />
      <div className="pointer-events-none absolute h-[530px] w-[530px] rounded-full border border-white/[0.055]" />

      <div
        className="pointer-events-none absolute h-[360px] w-[520px] opacity-70 blur-3xl transition-all duration-100"
        style={{
          background:
            "radial-gradient(circle, rgba(124,92,255,0.26), rgba(62,130,255,0.08) 45%, transparent 70%)",
          transform: `scale(${1 + avg * 0.08})`,
        }}
      />

      <div className="relative flex h-[230px] w-[520px] items-center justify-center">
        <div className="flex h-[150px] items-center gap-[18px]">
          {levels.map((value, index) => {
            const center = Math.abs(index - Math.floor(levels.length / 2));
            const centerBoost = 1 - center / Math.floor(levels.length / 2);
            const base = 14 + centerBoost * 60;
            const height = Math.max(16, base + value * 68);

            return (
              <span
                key={index}
                className="w-[13px] rounded-full shadow-[0_0_34px_rgba(130,140,255,0.55)] transition-[height,opacity,transform] duration-75"
                style={{
                  height,
                  opacity: 0.72 + value * 0.28,
                  transform: `scaleY(${0.92 + value * 0.18})`,
                  background:
                    index < levels.length / 2
                      ? "linear-gradient(to bottom, #c084fc, #737cff)"
                      : "linear-gradient(to bottom, #9aa6ff, #60a5fa)",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LocalVideoPreview() {
  const session = useSessionContext();
  const room = session.room;
  const version = useRoomRefresh(room);

  const { videoRef, hasVideo } = useParticipantVideoTrack(
    room?.localParticipant,
    version
  );

  return (
    <div className="absolute bottom-7 right-7 z-20 h-[178px] w-[250px] overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.05] shadow-2xl">
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-white/[0.09] to-white/[0.02] text-center">
          <div className="mb-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/70">
            Camera off
          </div>
          <div className="max-w-[12rem] text-xs leading-relaxed text-white/40">
            Turn on your camera to show your preview here.
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl bg-black/70 px-3 py-2 text-sm text-white shadow-lg backdrop-blur">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/20 text-[10px]">
          ♙
        </span>
        You
      </div>

      <div className="absolute bottom-4 right-4 flex h-7 items-end gap-1">
        {[8, 15, 21].map((h, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-green-400"
            style={{ height: h }}
          />
        ))}
      </div>
    </div>
  );
}

function AgentStage({ agentState }: { agentState: string }) {
  const session = useSessionContext();
  const room = session.room;
  const version = useRoomRefresh(room);

  const agentParticipant = getAgentParticipant(room);
  const { videoRef, hasVideo } = useParticipantVideoTrack(
    agentParticipant,
    version
  );

  const levels = useAgentAudioLevels(agentParticipant, version);
  const avg = levels.reduce((sum, v) => sum + v, 0) / levels.length;

  return (
    <section className="relative h-full overflow-hidden rounded-[14px] border border-white/[0.075] bg-[#03050a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(80,110,220,0.14),transparent_38%),radial-gradient(circle_at_28%_22%,rgba(139,92,246,0.10),transparent_30%)]" />

      <SpeakingCard agentState={agentState} level={avg} />

      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      <VoiceOrb levels={levels} hasAgentVideo={hasVideo} />

      <LocalVideoPreview />
    </section>
  );
}

function ChatPanel({
  open,
  messages,
}: {
  open: boolean;
  messages: ChatMessage[];
}) {
  if (!open) return null;

  return (
    <div className="absolute bottom-28 left-8 z-30 w-[360px] overflow-hidden rounded-3xl border border-violet-400/18 bg-[#070812] shadow-2xl backdrop-blur-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="text-sm font-semibold text-white">Chat</div>
        <div className="mt-1 text-xs text-white/45">
          Recent AlphaAvatar messages
        </div>
      </div>

      <div className="max-h-[360px] space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/45">
            No messages yet.
          </div>
        ) : (
          messages.slice(-8).map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-violet-500 text-white"
                    : "border border-white/10 bg-white/[0.055] text-white/80"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DockButton({
  active,
  disabled,
  onClick,
  icon,
  label,
  badge,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex h-[68px] w-[68px] flex-col items-center justify-center gap-1.5 rounded-[18px] border text-[13px] transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-200 shadow-[0_0_30px_rgba(99,102,241,0.25)]"
          : "border-white/8 bg-white/[0.055] text-white/75 hover:bg-white/[0.08]"
      }`}
    >
      {badge ? (
        <span className="absolute right-2 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1 text-[11px] font-semibold text-white">
          {badge}
        </span>
      ) : null}

      <div className="[&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <span>{label}</span>
    </button>
  );
}

function BottomDock({
  chatOpen,
  setChatOpen,
  input,
  setInput,
  onSend,
  isSending,
  messageCount,
  isLive,
  canUseMedia,
  onEndCall,
  onToast,
}: {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  messageCount: number;
  isLive: boolean;
  canUseMedia: boolean;
  onEndCall: () => void;
  onToast: (message: string, type?: DemoToast["type"]) => void;
}) {
  const session = useSessionContext();
  const room = session.room;
  const version = useRoomRefresh(room);

  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micChanging, setMicChanging] = useState(false);
  const [cameraChanging, setCameraChanging] = useState(false);

  const mounted = useMounted();
  const textEnabled = mounted && isLive;
  const mediaEnabled = mounted && canUseMedia;

  useEffect(() => {
    const localParticipant = room?.localParticipant;
    if (!localParticipant) return;

    const audioPub = Array.from(
      localParticipant.audioTrackPublications.values()
    ).find((pub) => pub.track && !pub.isMuted);

    const videoPub = Array.from(
      localParticipant.videoTrackPublications.values()
    ).find((pub) => pub.track && !pub.isMuted);

    setMicEnabled(Boolean(audioPub));
    setCameraEnabled(Boolean(videoPub));
  }, [room, version]);

  const toggleMic = useCallback(async () => {
    const localParticipant = room?.localParticipant;

    if (!canUseMedia) {
      onToast("Please wait until the LiveKit room is connected.", "info");
      return;
    }

    if (!localParticipant || micChanging) return;

    setMicChanging(true);

    try {
      const next = !micEnabled;
      await localParticipant.setMicrophoneEnabled(next);
      setMicEnabled(next);
    } catch (err) {
      console.error("[AlphaAvatar] toggle mic failed:", err);
      onToast(
        "Microphone permission failed. Please enable microphone access in your browser and try again.",
        "error"
      );
    } finally {
      setMicChanging(false);
    }
  }, [room, isLive, micEnabled, micChanging, onToast]);

  const toggleCamera = useCallback(async () => {
    const localParticipant = room?.localParticipant;

    if (!isLive) {
      onToast("Please wait until the realtime demo is connected.", "info");
      return;
    }

    if (!localParticipant || cameraChanging) return;

    setCameraChanging(true);

    try {
      const next = !cameraEnabled;
      await localParticipant.setCameraEnabled(next);
      setCameraEnabled(next);
    } catch (err) {
      console.error("[AlphaAvatar] toggle camera failed:", err);
      onToast(
        "Camera permission failed. Please enable camera access in your browser and try again.",
        "error"
      );
    } finally {
      setCameraChanging(false);
    }
  }, [room, isLive, cameraEnabled, cameraChanging, onToast]);

  return (
    <div className="relative z-30 h-[88px]">
      <div className="grid h-full grid-cols-[172px_445px_1fr_185px] items-center gap-4">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`h-[88px] rounded-[16px] border px-5 text-left transition ${
            chatOpen
              ? "border-violet-400/45 bg-violet-500/15 text-violet-200 shadow-[0_0_32px_rgba(139,92,246,0.22)]"
              : "border-white/10 bg-white/[0.045] hover:bg-white/[0.07]"
          }`}
        >
          <div className="flex items-center gap-3 text-white">
            <IconChat />
            <span className="text-[16px] font-semibold">Chat</span>
            {messageCount > 0 ? (
              <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-indigo-500 px-1 text-xs font-semibold">
                {Math.min(messageCount, 9)}
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-white/55">
            {messageCount === 0 ? "No messages yet" : `${messageCount} messages`}
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]" />
          </div>
        </button>

        <div className="flex h-[88px] items-center justify-center gap-3 rounded-[28px] border border-white/10 bg-white/[0.045] px-4 backdrop-blur-xl">
          <DockButton
            active={micEnabled}
            disabled={!mediaEnabled || micChanging}
            onClick={toggleMic}
            icon={<IconMic />}
            label="Mic"
          />

          <DockButton
            active={cameraEnabled}
            disabled={!mediaEnabled || cameraChanging}
            onClick={toggleCamera}
            icon={<IconCamera />}
            label="Camera"
          />

          <DockButton icon={<IconScreen />} label="Share" />

          <DockButton
            active={chatOpen}
            onClick={() => setChatOpen(!chatOpen)}
            icon={<IconChat />}
            label="Chat"
            badge={messageCount > 0 ? Math.min(messageCount, 9) : undefined}
          />

          <DockButton icon={<IconSettings />} label="Settings" />
        </div>

        <div className="flex h-[88px] items-center rounded-[24px] border border-white/10 bg-white/[0.045] px-5 backdrop-blur-xl">
          <div className="flex h-[58px] flex-1 items-center rounded-[18px] border border-violet-400/20 bg-[#090a12] px-5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!textEnabled}
              placeholder={textEnabled ? "Type a message..." : "Waiting for AlphaAvatar agent..."}
              className="h-full flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/35 disabled:cursor-not-allowed disabled:text-white/30"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  if (textEnabled) {
                    onSend();
                  }
                }
              }}
            />

            <button
              onClick={onSend}
              disabled={!textEnabled || isSending}
              className="ml-3 text-indigo-400 transition hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Send message"
            >
              <IconSend />
            </button>
          </div>
        </div>

        <button
          onClick={onEndCall}
          className="flex h-[68px] items-center justify-center gap-3 rounded-[18px] border border-red-400/20 bg-red-700 px-7 text-[15px] font-bold text-white shadow-[0_16px_60px_rgba(185,28,28,0.32)] transition hover:bg-red-600"
        >
          <IconPhoneOff />
          END CALL
        </button>
      </div>
    </div>
  );
}

function DemoShell({
  isLive,
  canUseMedia,
  callEnded,
  onEndCall,
  onRestart,
  onToast,
}: {
  isLive: boolean;
  canUseMedia: boolean;
  callEnded: boolean;
  onEndCall: () => void;
  onRestart: () => void;
  onToast: (message: string, type?: DemoToast["type"]) => void;
}) {
  const session = useSessionContext();
  const { state } = useAgent(session);
  const { messages, send, isSending } = useSessionMessages(session);

  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");

  const localIdentity = session.room?.localParticipant?.identity?.toLowerCase();

  const normalizedMessages: ChatMessage[] = useMemo(() => {
    return messages
      .map((msg: any, idx: number) => {
        const text =
          msg.content?.text ??
          msg.content?.content ??
          msg.content ??
          msg.text ??
          msg.message ??
          msg.transcript ??
          "";

        if (!text || typeof text !== "string") return null;

        const rawRole = String(
          msg.role ??
            msg.participant?.kind ??
            msg.participant?.identity ??
            msg.from?.kind ??
            msg.from?.identity ??
            msg.source ??
            msg.type ??
            ""
        ).toLowerCase();

        const identity = String(
          msg.participant?.identity ??
            msg.from?.identity ??
            msg.identity ??
            ""
        ).toLowerCase();

        const isUser =
          rawRole === "user" ||
          rawRole.includes("user") ||
          rawRole.includes("human") ||
          identity.includes("web-user") ||
          identity.includes("user-") ||
          Boolean(localIdentity && identity === localIdentity) ||
          msg.type === "userInput" ||
          msg.type === "userTranscript";

        const isAssistant =
          rawRole === "assistant" ||
          rawRole.includes("assistant") ||
          rawRole.includes("agent") ||
          rawRole.includes("avatar") ||
          identity.includes("agent") ||
          identity.includes("assistant") ||
          identity.includes("alphaavatar") ||
          msg.type === "agentResponse" ||
          msg.type === "agentTranscript";

        const role: "user" | "assistant" =
          isUser && !isAssistant ? "user" : "assistant";

        return {
          id: msg.id ?? msg.messageId ?? `msg-${idx}`,
          role,
          text,
          createdAt: msg.createdAt
            ? new Date(msg.createdAt).getTime()
            : msg.timestamp
              ? new Date(msg.timestamp).getTime()
              : idx,
        } satisfies ChatMessage;
      })
      .filter(Boolean)
      .sort((a, b) => a!.createdAt - b!.createdAt) as ChatMessage[];
  }, [messages, localIdentity]);

  const handleSend = useCallback(async () => {
    const text = input.trim();

    if (!text) return;

    if (!isLive) {
      onToast("AlphaAvatar is still connecting. Please try again in a moment.", "info");
      return;
    }

    try {
      await send(text);
      setInput("");
    } catch (err) {
      console.error("[AlphaAvatar] send failed:", err);
      onToast("Message failed to send. Please try again.", "error");
    }
  }, [input, isLive, send, onToast]);

  return (
    <div className="relative grid h-full grid-rows-[1fr_88px] gap-5">
      <RoomAudioRenderer />

      <div className="relative min-h-0">
        <AgentStage agentState={String(state ?? "disconnected")} />

        <ChatPanel open={chatOpen} messages={normalizedMessages} />

        {callEnded ? <EndedOverlay onRestart={onRestart} /> : null}
      </div>

      <BottomDock
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
        input={input}
        setInput={setInput}
        onSend={handleSend}
        isSending={isSending}
        messageCount={normalizedMessages.length}
        isLive={isLive && !callEnded}
        canUseMedia={canUseMedia && !callEnded}
        onEndCall={onEndCall}
        onToast={onToast}
      />
    </div>
  );
}

export default function DemoClient() {
  const session = useSessionContext();

  useRoomRefresh(session.room);

  const mounted = useMounted();
  const rawState = String(session.room?.state ?? "disconnected");
  const state = mounted ? rawState : "connecting";

  const { hasAgent, remoteCount } = useAgentAvailability(session.room);

  const [showConnectionNotice, setShowConnectionNotice] = useState(false);
  const [showAgentNotice, setShowAgentNotice] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [toasts, setToasts] = useState<DemoToast[]>([]);

  const status = getConnectionStatus(state);
  const isRoomConnected = state === "connected";
  const canUseMedia = isRoomConnected && !callEnded;
  const isLive = isRoomConnected && hasAgent && !callEnded;

  const pushToast = useCallback(
    (message: string, type: DemoToast["type"] = "info") => {
      const id = Date.now();

      setToasts((current) => [
        ...current.slice(-2),
        {
          id,
          type,
          message,
        },
      ]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 5000);
    },
    []
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    if (callEnded) {
      setShowConnectionNotice(false);
      return;
    }

    if (state === "connected") {
      setShowConnectionNotice(false);
      return;
    }

    if (
      state === "connecting" ||
      state === "reconnecting" ||
      state === "disconnected"
    ) {
      const timer = window.setTimeout(() => {
        setShowConnectionNotice(true);
      }, 9000);

      return () => {
        window.clearTimeout(timer);
      };
    }

    setShowConnectionNotice(false);
  }, [state, callEnded]);

  useEffect(() => {
    if (callEnded) {
      setShowAgentNotice(false);
      return;
    }

    if (state !== "connected") {
      setShowAgentNotice(false);
      return;
    }

    if (hasAgent) {
      setShowAgentNotice(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowAgentNotice(true);
    }, 9000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [state, hasAgent, callEnded]);

  const handleEndCall = useCallback(async () => {
    try {
      setCallEnded(true);
      setShowConnectionNotice(false);
      await session.end();
    } catch (err) {
      console.error("[AlphaAvatar] session.end failed:", err);
      pushToast("Failed to end the session. Please refresh the page.", "error");
    }
  }, [session, pushToast]);

  const handleRestart = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#02040b] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(100,116,255,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,255,0.13)_1px,transparent_1px)] bg-[size:18px_18px]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1510px] items-center px-8 py-8">
        <div className="relative h-[calc(100vh-64px)] min-h-[760px] w-full overflow-hidden rounded-[14px] border border-indigo-500/30 bg-black/70 shadow-[0_0_0_1px_rgba(255,255,255,0.025),0_30px_120px_rgba(0,0,0,0.7)]">
          <ConnectionNotice
            visible={(showConnectionNotice || showAgentNotice) && !callEnded}
            state={
              showAgentNotice
                ? `${state}, agent: ${hasAgent ? "joined" : "waiting"}, remote: ${remoteCount}`
                : state
            }
            reason={showAgentNotice ? "agent" : "connection"}
          />

          <ToastStack toasts={toasts} onDismiss={dismissToast} />

          <header className="flex h-[88px] items-center justify-between border-b border-white/[0.075] px-9">
            <AlphaLogo />

            <div className="flex items-center gap-3 text-sm text-white/60">
              <span
                className={`h-2 w-2 rounded-full ${
                  callEnded
                    ? "bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.75)]"
                    : isLive
                      ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]"
                      : isRoomConnected
                        ? "bg-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.75)]"
                        : status.dotClass
                }`}
              />

              {callEnded
                ? "Call ended"
                : isLive
                  ? "Realtime AI Avatar Demo"
                  : isRoomConnected
                    ? "Waiting for AlphaAvatar agent..."
                    : status.label}
            </div>
          </header>

          <div
            className={`absolute inset-x-[22px] bottom-[22px] top-[108px] transition ${
              (showConnectionNotice || showAgentNotice) && !callEnded
                ? "pointer-events-none opacity-45"
                : "opacity-100"
            }`}
          >
            <DemoShell
              isLive={isLive}
              canUseMedia={canUseMedia}
              callEnded={callEnded}
              onEndCall={handleEndCall}
              onRestart={handleRestart}
              onToast={pushToast}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
