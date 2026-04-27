// components/livekit/demo-client.tsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ControlBar,
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

    events.forEach((event) => {
      room.on(event as any, bump);
    });

    bump();

    return () => {
      events.forEach((event) => {
        room.off(event as any, bump);
      });
    };
  }, [room]);

  return version;
}

function useParticipantVideoTrack(
  participant: LocalParticipant | RemoteParticipant | undefined,
  version: number
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const publication = useMemo(() => {
    if (!participant) return undefined;

    const publications = Array.from(
      participant.videoTrackPublications.values()
    );

    return publications.find((pub) => {
      return pub.track && !pub.isMuted;
    });
  }, [participant, version]);

  useEffect(() => {
    const el = videoRef.current;
    const track = publication?.track;

    if (!el || !track || !("mediaStreamTrack" in track)) return;

    const mediaTrack = track.mediaStreamTrack;
    if (!mediaTrack) return;

    const stream = new MediaStream([mediaTrack]);
    el.srcObject = stream;

    void el.play().catch((err) => {
      console.warn("[AlphaAvatar demo] video play failed:", err);
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

function getAgentParticipant(room: Room | undefined) {
  if (!room) return undefined;

  const remoteParticipants = Array.from(room.remoteParticipants.values());

  if (remoteParticipants.length === 0) {
    return undefined;
  }

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

function AgentStatusBadge() {
  const session = useSessionContext();
  const { state } = useAgent(session);

  const labelMap: Record<string, string> = {
    connecting: "Connecting",
    listening: "Listening",
    thinking: "Thinking",
    speaking: "Speaking",
    disconnected: "Disconnected",
    initializing: "Initializing",
    connected: "Connected",
  };

  return (
    <div className="rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs tracking-wide text-white/70">
      {labelMap[String(state)] ?? String(state ?? "Live")}
    </div>
  );
}

function LocalVideoPreview({ chatOpen }: { chatOpen: boolean }) {
  const session = useSessionContext();
  const room = session.room;

  const version = useRoomRefresh(room);

  const localParticipant = room?.localParticipant;
  const { videoRef, hasVideo } = useParticipantVideoTrack(
    localParticipant,
    version
  );

  return (
    <div
      className={`absolute bottom-24 z-20 overflow-hidden rounded-2xl border border-white/10 bg-black/70 shadow-2xl transition-all duration-300 ${
        chatOpen ? "right-[25.5rem]" : "right-6"
      } h-36 w-56`}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-white/5 text-center">
          <p className="text-sm font-medium text-white/80">Camera off</p>
          <p className="mt-1 px-3 text-xs text-white/45">
            Turn on your camera to show your preview here.
          </p>
        </div>
      )}
    </div>
  );
}

function AgentStage({ chatOpen }: { chatOpen: boolean }) {
  const session = useSessionContext();
  const room = session.room;

  const version = useRoomRefresh(room);

  const agentParticipant = getAgentParticipant(room);
  const { videoRef, hasVideo } = useParticipantVideoTrack(
    agentParticipant,
    version
  );

  const remoteCount = room?.remoteParticipants.size ?? 0;
  const agentIdentity = agentParticipant?.identity ?? "-";

  return (
    <div className="relative h-full min-h-[680px] overflow-hidden rounded-[28px] border border-white/10 bg-black">
      <div className="absolute left-6 top-6 z-20 flex items-center gap-3">
        <div>
          <div className="text-sm font-semibold tracking-wide text-white/90">
            AlphaAvatar
          </div>
          <div className="mt-1 text-xs text-white/35">
            remote: {remoteCount} · agent: {agentIdentity}
          </div>
        </div>
      </div>

      <div className="absolute right-6 top-6 z-20 flex items-center gap-3">
        <div className="hidden text-xs uppercase tracking-[0.2em] text-white/65 md:block">
          Built with LiveKit Agents
        </div>
        <AgentStatusBadge />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        {hasVideo ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center px-6 text-center">
            <div className="mb-8 flex h-28 w-[360px] max-w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <div className="flex items-end gap-3">
                <span className="h-4 w-4 rounded-full bg-white/80" />
                <span className="h-10 w-4 rounded-full bg-white/80" />
                <span className="h-16 w-4 rounded-full bg-white/80" />
                <span className="h-24 w-4 rounded-full bg-white/90" />
                <span className="h-16 w-4 rounded-full bg-white/80" />
                <span className="h-10 w-4 rounded-full bg-white/80" />
                <span className="h-4 w-4 rounded-full bg-white/80" />
              </div>
            </div>

            <p className="text-3xl font-semibold text-white/90">
              Waiting for agent avatar
            </p>

            <p className="mt-3 max-w-xl text-sm text-white/45">
              If your AlphaAvatar agent joins this room and publishes audio or
              video, it will appear here.
            </p>

            <p className="mt-4 text-xs text-white/30">
              Room state: {String(room?.state ?? "disconnected")}
            </p>
          </div>
        )}
      </div>

      <LocalVideoPreview chatOpen={chatOpen} />
    </div>
  );
}

function MicDebug() {
  const session = useSessionContext();
  const room = session.room;

  const version = useRoomRefresh(room);

  const localParticipant = room?.localParticipant;

  const micPub = useMemo(() => {
    if (!localParticipant) return undefined;

    return Array.from(localParticipant.audioTrackPublications.values()).find(
      (pub) =>
        pub.source === "microphone" ||
        String(pub.trackName ?? "")
          .toLowerCase()
          .includes("mic")
    );
  }, [localParticipant, version]);

  const videoPub = useMemo(() => {
    if (!localParticipant) return undefined;

    return Array.from(localParticipant.videoTrackPublications.values()).find(
      (pub) => pub.track && !pub.isMuted
    );
  }, [localParticipant, version]);

  return (
    <div className="absolute left-6 bottom-28 z-20 rounded-xl border border-white/10 bg-black/70 px-4 py-3 text-xs text-white/70">
      <div>room: {String(room?.state ?? "disconnected")}</div>
      <div>mic publication: {micPub ? "yes" : "no"}</div>
      <div>mic muted: {micPub ? String(micPub.isMuted) : "-"}</div>
      <div>mic enabled: {micPub?.track ? "yes" : "no"}</div>
      <div>camera publication: {videoPub ? "yes" : "no"}</div>
      <div>camera enabled: {videoPub?.track ? "yes" : "no"}</div>
    </div>
  );
}

function ChatPanel({
  open,
  input,
  setInput,
  onSend,
  messages,
  isSending,
}: {
  open: boolean;
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  messages: ChatMessage[];
  isSending: boolean;
}) {
  if (!open) return null;

  return (
    <div className="absolute right-6 top-6 bottom-24 z-30 flex w-[380px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-sm font-semibold tracking-wide text-white/90">
          Chat
        </h2>
        <p className="mt-1 text-xs text-white/45">
          Messages are sent through the LiveKit session messages API.
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/50">
            No messages yet.
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`mb-1 px-1 text-[10px] uppercase tracking-[0.16em] ${
                  msg.role === "user" ? "text-white/35" : "text-white/45"
                }`}
              >
                {msg.role === "user" ? "You" : "AlphaAvatar"}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-white text-black"
                    : "border border-white/10 bg-white/5 text-white/85"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            rows={2}
            className="min-h-[48px] flex-1 resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <button
            onClick={onSend}
            disabled={isSending}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BottomDock({
  chatOpen,
  setChatOpen,
  connectionLabel,
  isSending,
  agentState,
}: {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  connectionLabel: string;
  isSending: boolean;
  agentState: string;
}) {
  const session = useSessionContext();
  const room = session.room;

  const version = useRoomRefresh(room);

  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  useEffect(() => {
    const localParticipant = room?.localParticipant;
    if (!localParticipant || !room) return;

    const updateState = () => {
      const audioPub = Array.from(
        localParticipant.audioTrackPublications.values()
      ).find((pub) => pub.track && !pub.isMuted);

      const videoPub = Array.from(
        localParticipant.videoTrackPublications.values()
      ).find((pub) => pub.track && !pub.isMuted);

      setMicEnabled(Boolean(audioPub));
      setCameraEnabled(Boolean(videoPub));
    };

    updateState();

    room.on("localTrackPublished", updateState);
    room.on("localTrackUnpublished", updateState);
    room.on("trackMuted", updateState);
    room.on("trackUnmuted", updateState);

    return () => {
      room.off("localTrackPublished", updateState);
      room.off("localTrackUnpublished", updateState);
      room.off("trackMuted", updateState);
      room.off("trackUnmuted", updateState);
    };
  }, [room, version]);

  const toggleMic = useCallback(async () => {
    const localParticipant = room?.localParticipant;
    if (!localParticipant) return;

    try {
      const next = !micEnabled;
      await localParticipant.setMicrophoneEnabled(next);
      setMicEnabled(next);
    } catch (err) {
      console.error("[AlphaAvatar demo] toggle mic failed:", err);
    }
  }, [room, micEnabled]);

  const toggleCamera = useCallback(async () => {
    const localParticipant = room?.localParticipant;
    if (!localParticipant) return;

    try {
      const next = !cameraEnabled;
      await localParticipant.setCameraEnabled(next);
      setCameraEnabled(next);
    } catch (err) {
      console.error("[AlphaAvatar demo] toggle camera failed:", err);
    }
  }, [room, cameraEnabled]);

  const endCall = useCallback(async () => {
    try {
      await session.end();
    } catch (err) {
      console.error("[AlphaAvatar demo] session.end failed:", err);
    }
  }, [session]);

  return (
    <div className="absolute bottom-6 left-6 right-6 z-20">
      <div className="flex items-center justify-between rounded-[28px] border border-white/10 bg-black/70 px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMic}
            disabled={!room}
            className={`rounded-2xl border px-4 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
              micEnabled
                ? "border-white/30 bg-white text-black"
                : "border-white/10 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            Mic
          </button>

          <button
            onClick={toggleCamera}
            disabled={!room}
            className={`rounded-2xl border px-4 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
              cameraEnabled
                ? "border-white/30 bg-white text-black"
                : "border-white/10 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            Camera
          </button>

          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`rounded-2xl border px-4 py-3 text-sm transition ${
              chatOpen
                ? "border-white/30 bg-white text-black"
                : "border-white/10 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            Chat
          </button>

          <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/50 md:block">
            {connectionLabel} · {agentState} {isSending ? "· sending" : ""}
          </div>
        </div>

        <button
          onClick={endCall}
          className="rounded-2xl border border-red-500/30 bg-red-500/15 px-6 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/25"
        >
          End Call
        </button>
      </div>
    </div>
  );
}

function DemoShell() {
  const session = useSessionContext();
  const { state } = useAgent(session);
  const { messages, send, isSending } = useSessionMessages(session);

  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");

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

        let role: "user" | "assistant" = "assistant";

        const isUser =
          rawRole === "user" ||
          rawRole.includes("user") ||
          rawRole.includes("human") ||
          identity.includes("web-user") ||
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

        if (isUser && !isAssistant) {
          role = "user";
        } else {
          role = "assistant";
        }

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
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;

    try {
      await send(text);
      setInput("");
    } catch (err) {
      console.error("[AlphaAvatar demo] send failed:", err);
    }
  }, [input, send]);

  return (
    <>
      <RoomAudioRenderer />

      <div className="fixed left-6 top-20 z-[9999] rounded-2xl border border-white/15 bg-black/80 p-3">
        <ControlBar
          controls={{
            microphone: true,
            camera: true,
            screenShare: false,
            chat: false,
            leave: false,
          }}
        />
      </div>

      <AgentStage chatOpen={chatOpen} />

      <MicDebug />

      <ChatPanel
        open={chatOpen}
        input={input}
        setInput={setInput}
        onSend={handleSend}
        messages={normalizedMessages}
        isSending={isSending}
      />

      <BottomDock
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
        connectionLabel={String(session.room?.state ?? "disconnected")}
        isSending={isSending}
        agentState={String(state ?? "disconnected")}
      />
    </>
  );
}

export default function DemoClient() {
  const session = useSessionContext();

  useRoomRefresh(session.room);

  const room = session.room?.name ?? "-";
  const identity = session.room?.localParticipant?.identity ?? "-";
  const state = String(session.room?.state ?? "disconnected");

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="mb-4">
          <Link
            href="/"
            className="text-sm text-white/60 transition hover:text-white"
          >
            ← Back to Home
          </Link>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            AlphaAvatar Demo
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Room: {room} · Identity: {identity} · State: {state}
          </p>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-5 shadow-2xl">
          <div className="relative h-[calc(100vh-170px)] min-h-[760px]">
            <DemoShell />
          </div>
        </div>
      </div>
    </main>
  );
}
