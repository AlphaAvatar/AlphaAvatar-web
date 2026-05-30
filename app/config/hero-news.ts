export type HeroNewsItem = {
  id: string;
  text: string;
  href?: string;
  external?: boolean;
  icon?: string;
};

export const HERO_NEWS_INTERVAL_MS = 4500;

export const HERO_NEWS_ITEMS: HeroNewsItem[] = [
  {
    id: "v0-6-0",
    icon: "🔥",
    text: "AlphaAvatar v0.6.0: Status plugin, sampled visual inputs, and status-aware tool feedback.",
    href: "https://github.com/AlphaAvatar/AlphaAvatar",
    external: true,
  },
  {
    id: "community-live",
    icon: "💬",
    text: "AlphaAvatar community is now live on Discord and GitHub Discussions.",
    href: "https://discord.gg/g22eMMYrW",
    external: true,
  },
  {
    id: "v0-5-5",
    icon: "🛠️",
    text: "v0.5.5 fixed inference runner registration lifecycle for production start mode.",
    href: "https://github.com/AlphaAvatar/AlphaAvatar",
    external: true,
  },
  {
    id: "vision-demo",
    icon: "🔥",
    text: "Realtime voice, text, and camera vision demo",
  },
  {
    id: "mcp-lancedb",
    icon: "🔥",
    text: "LanceDB-backed MCP tool retrieval is now available",
    href: "https://docs.alphaavatar.io",
    external: true,
  },
  {
    id: "runtime-context",
    icon: "🔥",
    text: "Runtime context now supports memory, persona, tools, and modality state",
  },
  {
    id: "whatsapp-channel",
    icon: "🔥",
    text: "WhatsApp channel support is integrated via Baileys",
  },
];
