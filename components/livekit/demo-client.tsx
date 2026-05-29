"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSessionContext } from "@livekit/components-react";

import { DemoShell } from "./demo/dock";
import { ConnectionNotice, ToastStack } from "./demo/feedback";
import {
  useAgentAvailability,
  useMounted,
  useRoomRefresh,
  useRuntimeStatusEvents,
} from "./demo/hooks";
import type { DemoToast, RuntimeEvent } from "./demo/types";
import { getConnectionStatus } from "./demo/utils";

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

  const liveRuntimeEvents = useRuntimeStatusEvents(session.room);

  const fallbackRuntimeEvents = useMemo<RuntimeEvent[]>(() => {
    if (callEnded) {
      return [
        {
          id: "call-ended",
          type: "session",
          title: "Session ended",
          description: "The current demo call has ended.",
          status: "idle",
          createdAt: 0,
        },
      ];
    }

    if (!isRoomConnected) {
      return [
        {
          id: "connecting",
          type: "session",
          title: status.label,
          description: "Preparing realtime connection.",
          status: "running",
          createdAt: 0,
        },
      ];
    }

    if (!hasAgent) {
      return [
        {
          id: "waiting-agent",
          type: "session",
          title: "Waiting for agent",
          description: "LiveKit room is connected. AlphaAvatar is joining.",
          status: "running",
          createdAt: 0,
        },
      ];
    }

    return [
      {
        id: "runtime-ready",
        type: "session",
        title: "Runtime ready",
        description: "Runtime is online and ready.",
        status: "success",
        createdAt: 0,
      },
    ];
  }, [callEnded, hasAgent, isRoomConnected, status.label]);

  const runtimeEvents =
    liveRuntimeEvents.length > 0 ? liveRuntimeEvents : fallbackRuntimeEvents;
  
    const headerStatusText = callEnded
  ? "Call ended"
  : isLive
    ? "Realtime AI Avatar Demo"
    : isRoomConnected
      ? "Waiting for AlphaAvatar agent..."
      : status.label;

  const headerDotClass = callEnded
    ? "bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.75)]"
    : isLive
      ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]"
      : isRoomConnected
        ? "bg-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.75)]"
        : status.dotClass;

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
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(100,116,255,0.105)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,255,0.105)_1px,transparent_1px)] bg-[size:18px_18px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(139,92,246,0.11),transparent_30%),radial-gradient(circle_at_82%_92%,rgba(220,38,38,0.08),transparent_24%),radial-gradient(circle_at_center,rgba(30,64,175,0.08),transparent_48%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1540px] items-center px-7 py-4">
        <div className="relative h-[calc(100vh-52px)] min-h-[760px] w-full overflow-hidden rounded-[20px] border border-indigo-400/24 bg-black/68 shadow-[0_0_0_1px_rgba(255,255,255,0.025),0_34px_130px_rgba(0,0,0,0.74),0_0_80px_rgba(99,102,241,0.08)] backdrop-blur-sm">
          <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/45 to-transparent" />

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

          <div
            className={`absolute inset-[22px] transition duration-300 ${
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
              runtimeEvents={runtimeEvents}
              headerStatusText={headerStatusText}
              headerDotClass={headerDotClass}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
