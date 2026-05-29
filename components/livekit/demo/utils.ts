import type { Room } from "livekit-client";
import type { AgentStatusWireEvent, RuntimeEvent } from "./types";

export const BARS = 11;

export function getConnectionStatus(state: string) {
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

export function getAgentParticipant(room: Room | undefined) {
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

function humanize(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/^AvatarModule\./, "")
    .replace(/_/g, " ")
    .replace(/\./g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getRuntimeEventKind(source?: string, type?: string): RuntimeEvent["type"] {
  const normalizedSource = String(source ?? "").toLowerCase();
  const normalizedType = String(type ?? "").toLowerCase();

  if (normalizedType.includes("error")) return "error";
  if (normalizedSource.includes("memory")) return "memory";
  if (normalizedSource.includes("persona")) return "persona";
  if (normalizedSource.includes("rag")) return "rag";
  if (normalizedSource.includes("mcp")) return "mcp";
  if (normalizedSource.includes("deepresearch")) return "deepresearch";
  if (normalizedSource.includes("planning")) return "planning";
  if (normalizedSource.includes("vision")) return "vision";
  if (normalizedSource.includes("voice")) return "voice";
  if (normalizedType.includes("tool")) return "tool";

  return "session";
}

function getRuntimeEventStatus(type?: string): RuntimeEvent["status"] {
  switch (type) {
    case "ready":
    case "tool_end":
      return "success";

    case "tool_error":
      return "error";

    case "thinking":
    case "tool_start":
    case "tool_progress":
    case "finalizing":
      return "running";

    default:
      return "idle";
  }
}

function getRuntimeEventTitle({
  type,
  source,
  stage,
  text,
  message,
}: {
  type?: string;
  source?: string;
  stage?: string | null;
  text?: string | null;
  message?: string | null;
}) {
  if (text?.trim()) return text.trim();
  if (message?.trim()) return message.trim();

  const sourceLabel = humanize(source);
  const stageLabel = humanize(stage);

  switch (type) {
    case "ready":
      return "Runtime ready";
    case "thinking":
      return "Alpha is thinking";
    case "tool_start":
      return stageLabel ? `${stageLabel} started` : "Tool started";
    case "tool_progress":
      return stageLabel ? `${stageLabel} in progress` : "Tool in progress";
    case "tool_end":
      return stageLabel ? `${stageLabel} completed` : "Tool completed";
    case "tool_error":
      return stageLabel ? `${stageLabel} failed` : "Tool failed";
    case "finalizing":
      return "Finalizing response";
    default:
      return sourceLabel || "Runtime event";
  }
}

export function normalizeAgentStatusPayload(
  payload: unknown,
  fallbackCreatedAt: number
): RuntimeEvent | null {
  if (!payload || typeof payload !== "object") return null;

  const wire = payload as AgentStatusWireEvent;

  if (
    wire.type !== "agent_status_action" &&
    wire.type !== "agent_status_text"
  ) {
    return null;
  }

  const event = wire.event ?? {};
  const statusType =
    event.type ?? wire.action?.status_type ?? "runtime_event";
  const source = event.source ?? wire.action?.source ?? "runtime";
  const stage = event.stage ?? wire.action?.stage ?? null;
  const createdAt = event.created_at
    ? Math.round(event.created_at * 1000)
    : fallbackCreatedAt;

  const title = getRuntimeEventTitle({
    type: statusType,
    source,
    stage,
    text: wire.text,
    message: event.message,
  });

  const id = [
    wire.type,
    source,
    stage ?? "none",
    statusType,
    createdAt,
    title,
  ].join(":");

  return {
    id,
    type: getRuntimeEventKind(source, statusType),
    title,
    description:
      stage || source
        ? [humanize(source), humanize(stage)].filter(Boolean).join(" · ")
        : undefined,
    status: getRuntimeEventStatus(statusType),
    source,
    stage,
    statusType,
    createdAt,
    raw: wire,
  };
}
