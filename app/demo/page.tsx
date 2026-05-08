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

function getBrowserTimeMetadata() {
  if (typeof window === "undefined") {
    return {
      timezone: "Unknown",
      timezone_source: "unknown",
      browser_locale: "Unknown",
      browser_utc_offset_minutes: 0,
    };
  }

  const timezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";

  const browserLocale =
    typeof navigator !== "undefined" ? navigator.language : "Unknown";

  // JavaScript getTimezoneOffset() returns minutes behind UTC.
  // For example:
  //   America/Los_Angeles daylight time => 420
  // We store UTC offset as signed minutes:
  //   America/Los_Angeles daylight time => -420
  const browserUtcOffsetMinutes = -new Date().getTimezoneOffset();

  return {
    timezone,
    timezone_source: "browser",
    browser_locale: browserLocale,
    browser_utc_offset_minutes: browserUtcOffsetMinutes,
  };
}

function buildDemoSessionEndpoint() {
  const metadata = getBrowserTimeMetadata();
  const params = new URLSearchParams();

  params.set("timezone", metadata.timezone);
  params.set("timezone_source", metadata.timezone_source);
  params.set("browser_locale", metadata.browser_locale);
  params.set(
    "browser_utc_offset_minutes",
    String(metadata.browser_utc_offset_minutes)
  );

  return `/api/demo-session?${params.toString()}`;
}

function DemoSessionInner() {
  const session = useSessionContext();

  const mountedRef = useRef(false);
  const startingRef = useRef(false);
  const startedRef = useRef(false);

  const [startError, setStartError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const startSession = useCallback(async () => {
    if (startingRef.current || startedRef.current) {
      console.log("[AlphaAvatar] session already starting/started, skip");
      return;
    }

    startingRef.current = true;

    try {
      if (mountedRef.current) {
        setStartError(null);
      }

      console.log("[AlphaAvatar] calling session.start()");

      await session.start();

      console.log("[AlphaAvatar] session.start() success", {
        room: session.room?.name,
        identity: session.room?.localParticipant?.identity,
        state: session.room?.state,
      });

      startedRef.current = true;

      if (mountedRef.current) {
        setStarted(true);
      }
    } catch (err) {
      console.error("[AlphaAvatar] session.start failed:", err);

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
      console.log("[AlphaAvatar] calling session.end()");

      startingRef.current = false;
      startedRef.current = false;

      await session.end();

      if (mountedRef.current) {
        setStarted(false);
      }
    } catch (err) {
      console.error("[AlphaAvatar] session.end failed:", err);
    }
  }, [session]);

  useEffect(() => {
    mountedRef.current = true;

    const timer = window.setTimeout(() => {
      void startSession();
    }, 100);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(timer);

      // Do not call session.end() here.
      // React StrictMode in dev can mount -> cleanup -> mount.
      // Calling end() here may disconnect the real session.
      console.log("[AlphaAvatar] cleanup");
    };

    // Intentionally run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {startError ? (
        <div className="fixed left-1/2 top-6 z-50 w-[calc(100%-48px)] max-w-[560px] -translate-x-1/2 rounded-[18px] border border-red-400/25 bg-red-950/55 px-5 py-4 text-center text-sm text-red-100 shadow-[0_20px_80px_rgba(185,28,28,0.24)] backdrop-blur-xl">
          <div className="flex items-center justify-center gap-2 font-semibold">
            <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.85)]" />
            Unable to start AlphaAvatar demo
          </div>

          <p className="mt-2 leading-6 text-red-100/75">
            The realtime demo is temporarily unavailable. Please try again later.
          </p>

          {process.env.NODE_ENV === "development" ? (
            <pre className="mt-3 max-h-32 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/35 p-3 text-left text-xs text-red-100/70">
              {startError}
            </pre>
          ) : null}

          <button
            onClick={() => {
              setStartError(null);
              startedRef.current = false;
              startingRef.current = false;
              void startSession();
            }}
            className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90"
          >
            Retry
          </button>
        </div>
      ) : null}

      <DemoClient />
    </>
  );
}

function DemoSessionRoot({ agentName }: { agentName: string }) {
  const tokenSource = useMemo(() => {
    return TokenSource.endpoint(buildDemoSessionEndpoint());
  }, []);

  const session = useSession(tokenSource, {
    agentName,
  });

  return (
    <SessionProvider session={session}>
      <DemoSessionInner />
    </SessionProvider>
  );
}

export default function DemoPage() {
  const agentName = process.env.NEXT_PUBLIC_AVATAR_NAME;

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

  return <DemoSessionRoot agentName={agentName} />;
}
