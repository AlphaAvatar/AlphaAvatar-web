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
