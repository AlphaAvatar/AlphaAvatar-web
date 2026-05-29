"use client";

import { useMemo, useState } from "react";
import type { RuntimeEvent } from "./types";

const FILTERS: Array<{
  label: string;
  value: "all" | RuntimeEvent["type"];
}> = [
  { label: "All", value: "all" },
  { label: "Memory", value: "memory" },
  { label: "Tool", value: "tool" },
  { label: "RAG", value: "rag" },
  { label: "MCP", value: "mcp" },
  { label: "Vision", value: "vision" },
  { label: "Planning", value: "planning" },
];

function getStatusStyle(status: RuntimeEvent["status"]) {
  switch (status) {
    case "running":
      return {
        dot: "bg-violet-400 shadow-[0_0_14px_rgba(167,139,250,0.8)]",
        badge: "border-violet-400/22 bg-violet-500/14 text-violet-200",
      };
    case "success":
      return {
        dot: "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]",
        badge: "border-emerald-400/22 bg-emerald-500/12 text-emerald-200",
      };
    case "error":
      return {
        dot: "bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.8)]",
        badge: "border-red-400/22 bg-red-500/12 text-red-200",
      };
    default:
      return {
        dot: "bg-white/35",
        badge: "border-white/10 bg-white/[0.04] text-white/50",
      };
  }
}

function getTypeIcon(type: RuntimeEvent["type"]) {
  switch (type) {
    case "memory":
      return "◎";
    case "persona":
      return "◌";
    case "tool":
      return "⌘";
    case "rag":
      return "◇";
    case "mcp":
      return "⌬";
    case "deepresearch":
      return "✦";
    case "planning":
      return "✧";
    case "vision":
      return "◉";
    case "voice":
      return "♬";
    case "error":
      return "!";
    default:
      return "✦";
  }
}

function getTypeColor(type: RuntimeEvent["type"]) {
  switch (type) {
    case "memory":
      return "from-emerald-400/24 to-emerald-500/8 text-emerald-200 shadow-[0_0_24px_rgba(52,211,153,0.16)]";
    case "tool":
    case "mcp":
      return "from-blue-400/24 to-blue-500/8 text-blue-200 shadow-[0_0_24px_rgba(96,165,250,0.16)]";
    case "rag":
    case "deepresearch":
      return "from-cyan-400/24 to-cyan-500/8 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.14)]";
    case "planning":
      return "from-amber-300/24 to-amber-500/8 text-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.14)]";
    case "vision":
      return "from-teal-300/24 to-teal-500/8 text-teal-200 shadow-[0_0_24px_rgba(45,212,191,0.14)]";
    case "error":
      return "from-red-400/24 to-red-500/8 text-red-200 shadow-[0_0_24px_rgba(248,113,113,0.16)]";
    default:
      return "from-violet-400/24 to-violet-500/8 text-violet-200 shadow-[0_0_24px_rgba(167,139,250,0.16)]";
  }
}

function formatRuntimeTime(createdAt: number) {
  if (!createdAt) return "--:--";

  const date = new Date(createdAt);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
}

function RuntimeEventRow({
  event,
  isLast,
}: {
  event: RuntimeEvent;
  isLast: boolean;
}) {
  const statusStyle = getStatusStyle(event.status);

  return (
    <div className="relative grid grid-cols-[58px_24px_minmax(0,1fr)] gap-3">
      <div className="pt-[18px] text-[11px] tabular-nums text-white/38">
        {formatRuntimeTime(event.createdAt)}
      </div>

      <div className="relative flex justify-center">
        {!isLast ? (
          <span className="absolute bottom-[-14px] top-[26px] w-px bg-gradient-to-b from-white/[0.16] to-white/[0.04]" />
        ) : null}

        <span
          className={`relative mt-[19px] h-2.5 w-2.5 rounded-full ring-4 ring-[#070812] ${statusStyle.dot}`}
        />
      </div>

      <div className="group rounded-[18px] border border-white/[0.075] bg-white/[0.035] p-3.5 transition hover:border-violet-400/24 hover:bg-white/[0.055]">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br ${getTypeColor(
              event.type
            )} shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}
          >
            <span className="text-[18px]">{getTypeIcon(event.type)}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-white">
                  {event.title}
                </div>

                {event.description ? (
                  <div className="mt-1 line-clamp-2 text-[12px] leading-5 text-white/45">
                    {event.description}
                  </div>
                ) : null}
              </div>

              <span
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] capitalize ${statusStyle.badge}`}
              >
                {event.status}
              </span>
            </div>

            {(event.source || event.stage || event.statusType) ? (
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-white/34">
                {event.source ? (
                  <span className="rounded-full border border-white/[0.06] bg-black/20 px-2 py-0.5">
                    {event.source}
                  </span>
                ) : null}

                {event.stage ? (
                  <span className="rounded-full border border-white/[0.06] bg-black/20 px-2 py-0.5">
                    {event.stage}
                  </span>
                ) : null}

                {event.statusType ? (
                  <span className="rounded-full border border-white/[0.06] bg-black/20 px-2 py-0.5">
                    {event.statusType}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RuntimeDrawer({
  open,
  events,
  onClose,
}: {
  open: boolean;
  events: RuntimeEvent[];
  onClose: () => void;
}) {
  const [filter, setFilter] = useState<"all" | RuntimeEvent["type"]>("all");

  const filteredEvents = useMemo(() => {
    const source = events
      .slice(0, 20)
      .sort((a, b) => a.createdAt - b.createdAt);

    if (filter === "all") return source;

    return source.filter((event) => event.type === filter);
  }, [events, filter]);

  if (!open) return null;

  const latest = events.length > 0 ? events[0] : undefined;

  return (
    <aside className="relative z-40 flex h-full min-h-0 overflow-hidden rounded-[26px] border border-violet-300/22 bg-[#070812]/96 shadow-[0_30px_120px_rgba(0,0,0,0.60),0_0_80px_rgba(99,102,241,0.12)] backdrop-blur-2xl">
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/55 to-transparent" />

      <div className="flex min-h-0 w-full flex-col">
        <div className="shrink-0 border-b border-white/[0.075] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.88)]" />

                <div className="text-[18px] font-semibold tracking-[-0.035em] text-white">
                  Runtime
                </div>
              </div>

              <div className="mt-1 truncate text-xs text-white/46">
                {latest?.title ?? "Personal OS"}
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg text-white/48 transition hover:border-violet-400/35 hover:bg-white/[0.08] hover:text-white"
              aria-label="Close runtime panel"
            >
              ×
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 rounded-[14px] border border-white/10 bg-black/22 p-1 text-xs">
            <button className="rounded-[10px] bg-violet-500/20 px-3 py-2 font-medium text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_24px_rgba(139,92,246,0.12)]">
              Timeline
            </button>
            <button className="rounded-[10px] px-3 py-2 text-white/44 transition hover:text-white/70">
              Details
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] transition ${
                  filter === item.value
                    ? "border-violet-300/40 bg-violet-500/24 text-violet-50 shadow-[0_0_20px_rgba(139,92,246,0.16)]"
                    : "border-white/10 bg-white/[0.035] text-white/48 hover:border-violet-400/25 hover:text-white/75"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 [scrollbar-color:rgba(139,92,246,0.35)_transparent]">
          {filteredEvents.length === 0 ? (
            <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4 text-sm text-white/45">
              No runtime events yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredEvents.map((event, index) => (
                <RuntimeEventRow
                  key={event.id}
                  event={event}
                  isLast={index === filteredEvents.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-white/[0.075] px-5 py-3">
          <div className="flex items-center justify-between text-xs text-white/42">
            <span>
              Showing {filteredEvents.length} / {Math.min(events.length, 20)} events
            </span>

            <button
              type="button"
              className="rounded-full border border-violet-400/14 bg-violet-500/[0.06] px-2.5 py-1 text-violet-100/55 transition hover:border-violet-400/30 hover:text-violet-100"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
