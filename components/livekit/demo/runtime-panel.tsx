import { IconSettings } from "./icons";
import type { RuntimeEvent } from "./types";

function getStatusDotClass(status?: RuntimeEvent["status"]) {
  switch (status) {
    case "running":
      return "bg-violet-400 shadow-[0_0_14px_rgba(167,139,250,0.85)]";
    case "success":
      return "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]";
    case "error":
      return "bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.8)]";
    default:
      return "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]";
  }
}

export function RuntimePanel({
  events,
  open,
  onOpen,
}: {
  events?: RuntimeEvent[];
  open?: boolean;
  onOpen?: () => void;
}) {
  const latest = events?.[0];

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group h-[88px] w-[190px] rounded-[18px] border px-5 text-left backdrop-blur-xl transition ${
        open
          ? "border-violet-300/55 bg-violet-500/[0.12] shadow-[0_0_0_1px_rgba(167,139,250,0.20),0_0_46px_rgba(139,92,246,0.26)]"
          : "border-violet-400/24 bg-[#090a14]/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_70px_rgba(0,0,0,0.34),0_0_38px_rgba(99,102,241,0.12)] hover:border-violet-400/38 hover:bg-[#0d0f1d]/82"
      }`}
    >
      <div className="flex h-full items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${getStatusDotClass(
                latest?.status
              )}`}
            />

            <span className="truncate text-[16px] font-semibold tracking-[-0.02em] text-white">
              Runtime
            </span>
          </div>

          <div className="mt-2 truncate text-[13px] text-violet-100/70">
            {latest?.title ?? "Personal OS"}
          </div>
        </div>

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-300/18 bg-white/[0.045] text-violet-200/90 transition group-hover:border-violet-300/32 group-hover:bg-violet-500/[0.10]">
          <IconSettings />
        </span>
      </div>
    </button>
  );
}
