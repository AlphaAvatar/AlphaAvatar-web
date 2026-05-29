export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
};

export type DemoToast = {
  id: number;
  type: "error" | "info";
  message: string;
};

export type AgentStatusWireEvent = {
  type: "agent_status_action" | "agent_status_text";
  event?: {
    type?: string;
    source?: string;
    stage?: string | null;
    message?: string | null;
    priority?: string;
    metadata?: Record<string, unknown>;
    created_at?: number;
  };
  text?: string | null;
  action?: {
    source?: string;
    stage?: string | null;
    status_type?: string;
  };
};

export type RuntimeEvent = {
  id: string;
  type:
    | "session"
    | "voice"
    | "vision"
    | "memory"
    | "persona"
    | "tool"
    | "rag"
    | "mcp"
    | "deepresearch"
    | "planning"
    | "error";

  title: string;
  description?: string;
  status: "idle" | "running" | "success" | "error";
  source?: string;
  stage?: string | null;
  statusType?: string;
  createdAt: number;
  raw?: AgentStatusWireEvent;
};
