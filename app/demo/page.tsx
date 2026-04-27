// app/demo/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DemoClient from "@/components/livekit/demo-client";
import {
  SessionProvider,
  useSession,
  useSessionContext,
} from "@livekit/components-react";
import { TokenSource } from "livekit-client";

function DemoSessionInner() {
  const session = useSessionContext();

  const mountedRef = useRef(false);
  const startingRef = useRef(false);
  const startedRef = useRef(false);

  const [startError, setStartError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const startSession = useCallback(async () => {
    if (startingRef.current || startedRef.current) {
      console.log("[AlphaAvatar demo] session already starting/started, skip");
      return;
    }

    startingRef.current = true;

    try {
      if (mountedRef.current) {
        setStartError(null);
      }

      console.log("[AlphaAvatar demo] calling session.start()");

      await session.start();

      console.log("[AlphaAvatar demo] session.start() success");
      console.log("[AlphaAvatar demo] room:", session.room);

      try {
        await session.room?.localParticipant.publishData(
          new TextEncoder().encode(
            JSON.stringify({
              type: "lk.agent.update",
              audio_input_enabled: true,
              audio_output_enabled: true,
              text_input_enabled: true,
              text_output_enabled: true,
            })
          ),
          {
            reliable: true,
            topic: "lk.agent.update",
          }
        );

        console.log("[AlphaAvatar demo] sent lk.agent.update");
      } catch (err) {
        console.error("[AlphaAvatar demo] failed to send lk.agent.update:", err);
      }

      startedRef.current = true;

      if (mountedRef.current) {
        setStarted(true);
      }
    } catch (err) {
      console.error("[AlphaAvatar demo] session.start failed:", err);

      startedRef.current = false;

      if (mountedRef.current) {
        setStarted(false);
        setStartError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      startingRef.current = false;
    }
  }, [session]);

  const endSession = useCallback(async () => {
    try {
      console.log("[AlphaAvatar demo] calling session.end()");

      startingRef.current = false;
      startedRef.current = false;

      await session.end();

      if (mountedRef.current) {
        setStarted(false);
      }
    } catch (err) {
      console.error("[AlphaAvatar demo] session.end failed:", err);
    }
  }, [session]);

  useEffect(() => {
    mountedRef.current = true;

    // Key points:
    // Next.js dev / React StrictMode will first mount -> cleanup -> mount.
    // Using setTimeout can prevent the system from starting immediately during the first fake mount and then being disconnected by cleanup.
    const timer = window.setTimeout(() => {
      void startSession();
    }, 100);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(timer);

      // Don't blindly call session.end() here.
      // In React StrictMode dev, cleanup will execute once, causing the connection to be disconnected immediately.
      // Let the End button handle the actual termination.
      console.log("[AlphaAvatar demo] cleanup");
    };
    // This is intentionally executed only once to avoid duplicate starts due to session state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {startError ? (
        <div className="fixed left-6 top-6 z-50 max-w-xl rounded-2xl border border-red-500/40 bg-red-950/90 p-4 text-sm text-red-100 shadow-2xl">
          <div className="font-semibold">session.start failed</div>

          <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
            {startError}
          </pre>

          <button
            onClick={() => {
              startedRef.current = false;
              startingRef.current = false;
              void startSession();
            }}
            className="mt-3 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Retry start
          </button>
        </div>
      ) : null}

      <div className="fixed right-6 top-6 z-50 flex gap-2">
        <button
          onClick={() => {
            startedRef.current = false;
            startingRef.current = false;
            void startSession();
          }}
          className="rounded-xl border border-white/15 bg-black/70 px-4 py-2 text-sm text-white"
        >
          Start
        </button>

        <button
          onClick={() => {
            void endSession();
          }}
          className="rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-2 text-sm text-red-200"
        >
          End
        </button>

        <div className="rounded-xl border border-white/15 bg-black/70 px-4 py-2 text-sm text-white/70">
          started: {String(started)}
        </div>
      </div>

      <DemoClient />
    </>
  );
}

export default function DemoPage() {
  const agentName = process.env.NEXT_PUBLIC_AVATAR_NAME;

  const tokenSource = useMemo(() => {
    return TokenSource.endpoint("/api/demo-session");
  }, []);

  if (!agentName) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <h1 className="text-3xl font-bold">AlphaAvatar Demo</h1>
        <p className="mt-4 text-red-400">
          Missing NEXT_PUBLIC_AVATAR_NAME in .env.local
        </p>
      </main>
    );
  }

  const session = useSession(tokenSource, {
    agentName,
  });

  return (
    <SessionProvider session={session}>
      <DemoSessionInner />
    </SessionProvider>
  );
}