"use client";

import { useSessionContext } from "@livekit/components-react";

import {
  useAgentAudioLevels,
  useParticipantVideoTrack,
  useRoomRefresh,
} from "./hooks";
import { getAgentParticipant } from "./utils";

export function SpeakingCard({
  agentState,
  level,
}: {
  agentState: string;
  level: number;
}) {
  const normalizedState = agentState.toLowerCase();
  const isSpeaking = normalizedState === "speaking" || level > 0.2;

  const title = (() => {
    if (isSpeaking) return "Alpha is speaking...";
    if (normalizedState === "thinking") return "Alpha is thinking...";
    if (normalizedState === "listening") return "Alpha is listening...";
    if (normalizedState === "connecting") return "Alpha is connecting...";
    if (normalizedState === "disconnected") return "Alpha is offline";
    return "Alpha is ready";
  })();

  const description = (() => {
    if (isSpeaking) return "Responding with realtime voice";
    if (normalizedState === "thinking") return "Understanding context, tools, and visual input";
    if (normalizedState === "listening") return "Listening for your voice or message";
    if (normalizedState === "connecting") return "Preparing realtime session";
    if (normalizedState === "disconnected") return "Waiting for the demo session";
    return "Ready for voice, text, and vision";
  })();

  return (
    <div className="absolute left-6 top-6 z-20 w-[334px] overflow-hidden rounded-[20px] border border-violet-200/14 bg-[#11111e]/72 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_22px_80px_rgba(0,0,0,0.38),0_0_42px_rgba(99,102,241,0.10)] backdrop-blur-2xl">
      <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/52 to-transparent" />

      <div className="relative flex items-center gap-3">
        <div className="text-[18px] text-violet-200 drop-shadow-[0_0_14px_rgba(167,139,250,0.45)]">✦</div>

        <div className="min-w-0 flex-1 truncate text-[17px] font-semibold tracking-[-0.02em] text-violet-200">
          {title}
        </div>

        <div className="ml-auto flex h-5 items-end gap-[4px]">
          {[0.45, 0.72, 1, 0.82].map((scale, i) => (
            <span
              key={i}
              className="w-[4px] rounded-full bg-indigo-300 shadow-[0_0_12px_rgba(129,140,248,0.52)] transition-all duration-100"
              style={{
                height: `${5 + Math.max(level, 0.12) * 18 * scale}px`,
                opacity: 0.55 + Math.min(level, 1) * 0.45,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative mt-2 text-[14px] leading-6 text-white/52">
        {description}
      </div>
    </div>
  );
}

export function VoiceOrb({
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
      <div className="pointer-events-none absolute h-[720px] w-[720px] rounded-full border border-white/[0.045]" />
      <div className="pointer-events-none absolute h-[540px] w-[540px] rounded-full border border-white/[0.052]" />
      <div className="pointer-events-none absolute h-[390px] w-[390px] rounded-full border border-violet-200/[0.030]" />

      <div
        className="pointer-events-none absolute h-[380px] w-[620px] opacity-75 blur-3xl transition-all duration-100"
        style={{
          background:
            "radial-gradient(circle, rgba(124,92,255,0.30), rgba(62,130,255,0.10) 44%, transparent 72%)",
          transform: `scale(${1 + avg * 0.085})`,
        }}
      />

      <div className="pointer-events-none absolute h-[220px] w-[720px] bg-[radial-gradient(ellipse_at_center,rgba(129,140,248,0.09),transparent_64%)]" />

      <div className="relative flex h-[250px] w-[620px] items-center justify-center">
        <div className="flex h-[170px] items-center gap-[15px]">
          {levels.map((value, index) => {
            const center = Math.abs(index - Math.floor(levels.length / 2));
            const centerBoost = 1 - center / Math.floor(levels.length / 2);
            const base = 10 + centerBoost * 56;
            const height = Math.max(12, base + value * 86);
            const isLeft = index < levels.length / 2;

            return (
              <span
                key={index}
                className="w-[13px] rounded-full shadow-[0_0_34px_rgba(130,140,255,0.58)] transition-[height,opacity,transform] duration-75"
                style={{
                  height,
                  opacity: 0.70 + value * 0.30,
                  transform: `scaleY(${0.88 + value * 0.22})`,
                  background: isLeft
                    ? "linear-gradient(to bottom, #d8b4fe, #8b5cf6 54%, #6366f1)"
                    : "linear-gradient(to bottom, #bfdbfe, #818cf8 46%, #60a5fa)",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function LocalVideoPreview() {
  const session = useSessionContext();
  const room = session.room;
  const version = useRoomRefresh(room);

  const { videoRef, hasVideo } = useParticipantVideoTrack(
    room?.localParticipant,
    version
  );

  return (
    <div className="absolute bottom-7 right-7 z-20 h-[164px] w-[232px] overflow-hidden rounded-[22px] border border-white/12 bg-white/[0.045] shadow-[0_24px_80px_rgba(0,0,0,0.45),0_0_40px_rgba(99,102,241,0.10)] backdrop-blur-xl">
      {hasVideo ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover"
          />

          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-emerald-300/22 bg-emerald-400/16 px-2.5 py-1 text-[11px] font-medium text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.20)] backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            Vision active
          </div>
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-white/[0.08] via-white/[0.035] to-white/[0.015] text-center">
          <div className="mb-3 rounded-full border border-white/10 bg-black/34 px-4 py-2 text-sm text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            Vision off
          </div>
          <div className="max-w-[12rem] text-xs leading-relaxed text-white/38">
            Turn on your vision to enable visual context.
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl bg-black/72 px-3 py-2 text-sm text-white shadow-lg backdrop-blur-xl">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/20 text-[10px]">
          ♙
        </span>
        {hasVideo ? "You · Vision" : "You"}
      </div>

      {hasVideo ? (
        <div className="absolute bottom-4 right-4 flex h-7 items-end gap-1">
          {[9, 18, 25].map((h, i) => (
            <span
              key={i}
              className="w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.60)]"
              style={{ height: h }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AgentStage({ agentState }: { agentState: string }) {
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
    <section className="relative h-full overflow-hidden rounded-[18px] border border-white/[0.075] bg-[#03050a] shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(80,110,220,0.16),transparent_42%),radial-gradient(circle_at_28%_22%,rgba(139,92,246,0.12),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.035),transparent_42%)]" />
      <div className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(rgba(148,163,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,255,0.10)_1px,transparent_1px)] bg-[size:44px_44px]" />

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
