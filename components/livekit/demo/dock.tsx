"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  RoomAudioRenderer,
  useAgent,
  useSessionContext,
  useSessionMessages,
} from "@livekit/components-react";

import { EndedOverlay } from "./feedback";
import { useLocalAudioActivity, useMounted, useRoomRefresh } from "./hooks";
import {
  AlphaLogo,
  IconChat,
  IconPhoneOff,
  IconScreen,
  IconSend,
  IconSettings,
  IconVision,
  IconVoice,
} from "./icons";
import { RuntimePanel } from "./runtime-panel";
import { RuntimeDrawer } from "./runtime-drawer";
import { AgentStage } from "./stage";
import type { ChatMessage, DemoToast, RuntimeEvent } from "./types";

function formatMessageTime(value: number) {
  if (!Number.isFinite(value) || value < 1_000_000_000_000) return "";

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function MiniVoiceMeter({
  active,
  level,
}: {
  active: boolean;
  level: number;
}) {
  if (!active) return null;

  const safeLevel = Math.max(0, Math.min(level, 1));

  return (
    <div className="mt-2 flex h-[8px] items-end justify-center gap-[4px]">
      {[0.55, 0.85, 1, 0.7].map((scale, index) => (
        <span
          key={index}
          className="w-[4px] rounded-full bg-[#ec8a9a] shadow-[0_0_12px_rgba(236,138,154,0.45)] transition-all duration-75"
          style={{
            height: `${3 + safeLevel * 6 * scale}px`,
            opacity: 0.56 + safeLevel * 0.44,
          }}
        />
      ))}
    </div>
  );
}

export function DockButton({
  active,
  disabled,
  onClick,
  icon,
  label,
  badge,
  subIndicator,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  icon: ReactNode;
  label: string;
  badge?: number;
  subIndicator?: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-[22px] border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? "border-violet-300/48 bg-violet-500/[0.14] text-violet-50 shadow-[0_0_0_1px_rgba(139,92,246,0.16),0_0_38px_rgba(99,102,241,0.30)]"
          : "border-white/[0.085] bg-white/[0.040] text-white/64 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] hover:border-violet-300/24 hover:bg-white/[0.065] hover:text-white/86"
      }`}
    >
      {badge ? (
        <span className="absolute right-2 top-2 z-20 flex h-5 min-w-5 items-center justify-center rounded-full border border-white/10 bg-indigo-500 px-1 text-[11px] font-semibold text-white shadow-[0_0_18px_rgba(99,102,241,0.55)]">
          {badge}
        </span>
      ) : null}

      {active ? (
        <>
          <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/80 to-transparent" />
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(167,139,250,0.22),transparent_48%)]" />
          <span className="pointer-events-none absolute -bottom-10 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-violet-500/16 blur-2xl" />
        </>
      ) : null}

      <div className="relative z-10 flex flex-col items-center justify-center">
        <div
          className={`flex h-7 items-center justify-center transition [&_svg]:h-6 [&_svg]:w-6 ${
            active
              ? "text-violet-50 drop-shadow-[0_0_14px_rgba(196,181,253,0.35)]"
              : "text-white/68 group-hover:text-white/90"
          }`}
        >
          {icon}
        </div>

        {subIndicator ? <div className="h-[12px]">{subIndicator}</div> : null}
      </div>
    </button>
  );
}

export function ChatPanel({
  open,
  messages,
  onClose,
}: {
  open: boolean;
  messages: ChatMessage[];
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <aside className="relative z-20 flex h-full min-h-0 overflow-hidden rounded-[26px] border border-violet-300/16 bg-[#070812]/92 shadow-[0_28px_100px_rgba(0,0,0,0.50),0_0_60px_rgba(99,102,241,0.10)] backdrop-blur-2xl">
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/42 to-transparent" />
      <div className="flex min-h-0 w-full flex-col">
        <div className="shrink-0 border-b border-white/[0.075] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[15px] font-semibold tracking-[-0.02em] text-white">
                Chat
              </div>
              <div className="mt-1 text-xs text-white/42">
                Recent AlphaAvatar messages
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full border border-violet-300/22 bg-violet-500/14 px-2.5 py-1 text-xs font-medium text-violet-100/85">
                {messages.length}
              </div>

              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-sm text-white/42 transition hover:border-violet-300/35 hover:bg-white/[0.075] hover:text-white"
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 [scrollbar-color:rgba(139,92,246,0.35)_transparent]">
          {messages.length === 0 ? (
            <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4 text-sm text-white/42">
              No messages yet.
            </div>
          ) : (
            messages.slice(-12).map((msg) => {
              const time = formatMessageTime(msg.createdAt);

              return (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[86%] rounded-[18px] px-4 py-3 text-sm leading-relaxed shadow-[0_12px_35px_rgba(0,0,0,0.22)] ${
                      msg.role === "user"
                        ? "bg-violet-500 text-white shadow-[0_12px_35px_rgba(139,92,246,0.25)]"
                        : "border border-white/10 bg-white/[0.055] text-white/78"
                    }`}
                  >
                    <div>{msg.text}</div>
                    {time ? (
                      <div
                        className={`mt-1.5 text-[11px] ${
                          msg.role === "user" ? "text-white/58" : "text-white/32"
                        }`}
                      >
                        {time}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}

function BottomDock({
  chatOpen,
  setChatOpen,
  runtimeOpen,
  setRuntimeOpen,
  input,
  setInput,
  onSend,
  isSending,
  messageCount,
  isLive,
  canUseMedia,
  onEndCall,
  onToast,
  runtimeEvents,
}: {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  runtimeOpen: boolean;
  setRuntimeOpen: (open: boolean) => void;
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  messageCount: number;
  isLive: boolean;
  canUseMedia: boolean;
  onEndCall: () => void;
  onToast: (message: string, type?: DemoToast["type"]) => void;
  runtimeEvents?: RuntimeEvent[];
}) {
  const session = useSessionContext();
  const room = session.room;
  const version = useRoomRefresh(room);

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [visionEnabled, setVisionEnabled] = useState(false);
  const [voiceChanging, setVoiceChanging] = useState(false);
  const [visionChanging, setVisionChanging] = useState(false);

  const mounted = useMounted();
  const textEnabled = mounted && isLive;
  const mediaEnabled = mounted && canUseMedia;

  const { level: localVoiceLevel } = useLocalAudioActivity(
    room?.localParticipant,
    version,
    voiceEnabled && mediaEnabled
  );

  useEffect(() => {
    const localParticipant = room?.localParticipant;
    if (!localParticipant) return;

    const audioPub = Array.from(
      localParticipant.audioTrackPublications.values()
    ).find((pub) => pub.track && !pub.isMuted);

    const videoPub = Array.from(
      localParticipant.videoTrackPublications.values()
    ).find((pub) => pub.track && !pub.isMuted);

    setVoiceEnabled(Boolean(audioPub));
    setVisionEnabled(Boolean(videoPub));
  }, [room, version]);

  const toggleVoice = useCallback(async () => {
    const localParticipant = room?.localParticipant;

    if (!canUseMedia) {
      onToast("Please wait until the LiveKit room is connected.", "info");
      return;
    }

    if (!localParticipant || voiceChanging) return;

    setVoiceChanging(true);

    try {
      const next = !voiceEnabled;
      await localParticipant.setMicrophoneEnabled(next);
      setVoiceEnabled(next);
    } catch (err) {
      console.error("[AlphaAvatar] toggle voice failed:", err);
      onToast(
        "Microphone permission failed. Please enable microphone access in your browser and try again.",
        "error"
      );
    } finally {
      setVoiceChanging(false);
    }
  }, [room, canUseMedia, voiceEnabled, voiceChanging, onToast]);

  const toggleVision = useCallback(async () => {
    const localParticipant = room?.localParticipant;

    if (!canUseMedia) {
      onToast("Please wait until the LiveKit room is connected.", "info");
      return;
    }

    if (!localParticipant || visionChanging) return;

    setVisionChanging(true);

    try {
      const next = !visionEnabled;
      await localParticipant.setCameraEnabled(next);
      setVisionEnabled(next);

      if (next) {
        onToast("Vision is active. Try asking: “What am I doing?”", "info");
      } else {
        onToast("Vision is off.", "info");
      }
    } catch (err) {
      console.error("[AlphaAvatar] toggle vision failed:", err);
      onToast(
        "Vision permission failed. Please enable vision access in your browser and try again.",
        "error"
      );
    } finally {
      setVisionChanging(false);
    }
  }, [room, canUseMedia, visionEnabled, visionChanging, onToast]);

  return (
    <div className="relative z-30 h-[88px]">
      <div className="grid h-full grid-cols-[190px_445px_minmax(420px,1fr)_185px] items-center gap-4">
        <RuntimePanel
          events={runtimeEvents}
          open={runtimeOpen}
          onOpen={() => setRuntimeOpen(!runtimeOpen)}
        />

        <div className="flex h-[88px] items-center justify-center gap-3 rounded-[30px] border border-white/[0.075] bg-[#080a12]/76 px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_20px_75px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
          <DockButton
            active={voiceEnabled}
            disabled={!mediaEnabled || voiceChanging}
            onClick={toggleVoice}
            icon={<IconVoice />}
            label="Voice"
            subIndicator={
              <MiniVoiceMeter active={voiceEnabled} level={localVoiceLevel} />
            }
          />

          <DockButton
            active={visionEnabled}
            disabled={!mediaEnabled || visionChanging}
            onClick={toggleVision}
            icon={<IconVision />}
            label="Vision"
          />

          <DockButton
            icon={<IconScreen />}
            label="Screen"
            onClick={() => {
              onToast("Screen vision is coming soon.", "info");
            }}
          />

          <DockButton
            active={chatOpen}
            onClick={() => setChatOpen(!chatOpen)}
            icon={<IconChat />}
            label="Timeline"
            badge={messageCount > 0 ? Math.min(messageCount, 9) : undefined}
          />

          <DockButton
            icon={<IconSettings />}
            label="Control"
            onClick={() => {
              onToast("Control center is coming soon.", "info");
            }}
          />
        </div>

        <div className="flex h-[88px] items-center rounded-[26px] border border-white/[0.075] bg-[#080a12]/70 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.045),0_18px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="flex h-[58px] flex-1 items-center rounded-[19px] border border-violet-300/18 bg-[#070812]/92 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition focus-within:border-violet-300/36 focus-within:shadow-[0_0_34px_rgba(99,102,241,0.16)]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!textEnabled}
              placeholder={
                textEnabled ? "Type a message..." : "Waiting for AlphaAvatar agent..."
              }
              className="h-full flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/34 disabled:cursor-not-allowed disabled:text-white/30"
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
              className="ml-3 text-indigo-300 transition hover:text-indigo-200 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Send message"
            >
              <IconSend />
            </button>
          </div>
        </div>

        <button
          onClick={onEndCall}
          className="flex h-[68px] items-center justify-center gap-3 rounded-[19px] border border-red-300/24 bg-red-700 px-7 text-[15px] font-bold text-white shadow-[0_18px_65px_rgba(185,28,28,0.38),0_0_44px_rgba(220,38,38,0.18)] transition hover:bg-red-600 hover:shadow-[0_20px_75px_rgba(185,28,28,0.46),0_0_52px_rgba(220,38,38,0.24)]"
        >
          <IconPhoneOff />
          END CALL
        </button>
      </div>
    </div>
  );
}

export function DemoShell({
  isLive,
  canUseMedia,
  callEnded,
  onEndCall,
  onRestart,
  onToast,
  runtimeEvents,
  headerStatusText,
  headerDotClass,
}: {
  isLive: boolean;
  canUseMedia: boolean;
  callEnded: boolean;
  onEndCall: () => void;
  onRestart: () => void;
  onToast: (message: string, type?: DemoToast["type"]) => void;
  runtimeEvents?: RuntimeEvent[];
  headerStatusText: string;
  headerDotClass: string;
}) {
  const session = useSessionContext();
  const { state } = useAgent(session);
  const { messages, send, isSending } = useSessionMessages(session);

  const [chatOpen, setChatOpen] = useState(false);
  const [runtimeOpen, setRuntimeOpen] = useState(false);
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
    <div
      className={`relative grid h-full gap-5 transition-[grid-template-columns] duration-300 ${
        runtimeOpen && chatOpen
          ? "grid-cols-[minmax(0,1fr)_430px_380px]"
          : runtimeOpen
            ? "grid-cols-[minmax(0,1fr)_430px]"
            : chatOpen
              ? "grid-cols-[minmax(0,1fr)_380px]"
              : "grid-cols-[minmax(0,1fr)]"
      } grid-rows-[76px_minmax(0,1fr)_88px]`}
    >
      <RoomAudioRenderer />

      <header className="col-start-1 row-start-1 flex min-w-0 items-center justify-between rounded-[18px] border border-white/[0.07] bg-[#070812]/62 px-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_70px_rgba(0,0,0,0.26)] backdrop-blur-xl">
        <AlphaLogo />

        <div className="flex items-center gap-3 text-sm text-white/58">
          <span className={`h-2 w-2 rounded-full ${headerDotClass}`} />
          {headerStatusText}
        </div>
      </header>

      <div className="relative col-start-1 row-start-2 min-h-0">
        <AgentStage agentState={String(state ?? "disconnected")} />

        {callEnded ? <EndedOverlay onRestart={onRestart} /> : null}
      </div>

      {runtimeOpen ? (
        <div className="col-start-2 row-start-1 row-span-2 min-h-0">
          <RuntimeDrawer
            open={runtimeOpen}
            events={runtimeEvents ?? []}
            onClose={() => setRuntimeOpen(false)}
          />
        </div>
      ) : null}

      {chatOpen ? (
        <div
          className={`row-start-1 row-span-2 min-h-0 ${
            runtimeOpen ? "col-start-3" : "col-start-2"
          }`}
        >
          <ChatPanel
            open={chatOpen}
            messages={normalizedMessages}
            onClose={() => setChatOpen(false)}
          />
        </div>
      ) : null}

      <div className="col-span-full row-start-3">
        <BottomDock
          chatOpen={chatOpen}
          setChatOpen={setChatOpen}
          runtimeOpen={runtimeOpen}
          setRuntimeOpen={setRuntimeOpen}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          isSending={isSending}
          messageCount={normalizedMessages.length}
          isLive={isLive && !callEnded}
          canUseMedia={canUseMedia && !callEnded}
          onEndCall={onEndCall}
          onToast={onToast}
          runtimeEvents={runtimeEvents}
        />
      </div>
    </div>
  );
}
