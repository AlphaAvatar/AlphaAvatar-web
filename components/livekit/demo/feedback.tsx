"use client";

import { IconPhoneOff } from "./icons";
import type { DemoToast } from "./types";

export function ConnectionNotice({
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
      <div className="relative overflow-hidden rounded-[20px] border border-red-300/20 bg-[#18070c]/78 px-5 py-4 text-center shadow-[0_24px_90px_rgba(185,28,28,0.20)] backdrop-blur-2xl">
        <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-red-300/50 to-transparent" />
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-red-100">
          <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.8)]" />
          {title}
        </div>

        <p className="mt-2 text-sm leading-6 text-red-100/68">{message}</p>

        <div className="mt-4 flex items-center justify-center gap-3">
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

export function ToastStack({
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
          className={`rounded-[18px] border px-4 py-3 shadow-[0_22px_70px_rgba(0,0,0,0.36)] backdrop-blur-2xl ${
            toast.type === "error"
              ? "border-red-300/20 bg-[#18070c]/80 text-red-100"
              : "border-violet-300/18 bg-[#080914]/88 text-white"
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

            <p className="flex-1 text-sm leading-6 text-white/78">
              {toast.message}
            </p>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/38 transition hover:text-white"
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

export function EndedOverlay({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/48 backdrop-blur-[5px]">
      <div className="relative w-[430px] max-w-[calc(100%-48px)] overflow-hidden rounded-[26px] border border-violet-300/14 bg-[#070812]/88 px-7 py-7 text-center shadow-[0_28px_120px_rgba(0,0,0,0.60),0_0_70px_rgba(99,102,241,0.12)] backdrop-blur-2xl">
        <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/55 to-transparent" />
        <span className="pointer-events-none absolute -top-20 left-1/2 h-40 w-48 -translate-x-1/2 rounded-full bg-violet-500/12 blur-3xl" />

        <div className="relative mx-auto mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-[18px] border border-violet-300/22 bg-violet-500/14 text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_28px_rgba(139,92,246,0.18)]">
          <IconPhoneOff />
        </div>

        <div className="relative text-[20px] font-semibold tracking-[-0.03em] text-white">
          Call ended
        </div>

        <p className="relative mx-auto mt-3 max-w-[320px] text-sm leading-6 text-white/54">
          The current demo session has ended. Start a new session to continue
          talking with AlphaAvatar.
        </p>

        <button
          onClick={onRestart}
          className="relative mt-6 rounded-[15px] bg-white px-5 py-2.5 text-sm font-medium text-black shadow-[0_12px_35px_rgba(255,255,255,0.10)] transition hover:opacity-90"
        >
          Start Again
        </button>
      </div>
    </div>
  );
}
