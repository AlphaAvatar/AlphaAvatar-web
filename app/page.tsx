import Link from "next/link";
import RotatingNewsPill from "@/components/home/rotating-news-pill";
import {
  HERO_NEWS_INTERVAL_MS,
  HERO_NEWS_ITEMS,
} from "@/app/config/hero-news";

function AlphaLogo() {
  return (
    <div className="flex items-center gap-3.5">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-violet-500/20 blur-xl" />

        <svg
          viewBox="0 0 48 48"
          className="relative h-9 w-9 drop-shadow-[0_0_18px_rgba(139,92,246,0.45)]"
          fill="none"
        >
          <defs>
            <linearGradient
              id="alpha-logo-gradient-home"
              x1="8"
              y1="6"
              x2="40"
              y2="42"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#C4B5FD" />
              <stop offset="48%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
          </defs>

          <path
            d="M24 6.5L41 39L27.4 31.8L24 39.3L20.6 31.8L7 39L24 6.5Z"
            stroke="url(#alpha-logo-gradient-home)"
            strokeWidth="4.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M24 16.5L31.5 31.2L26.5 28.6L24 34L21.5 28.6L16.5 31.2L24 16.5Z"
            stroke="url(#alpha-logo-gradient-home)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
          />
        </svg>
      </div>

      <div className="text-[23px] font-semibold tracking-[-0.03em] text-white">
        AlphaAvatar
      </div>
    </div>
  );
}

function GitHubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.75 5.6.75 11.9c0 5.05 3.29 9.33 7.86 10.84.57.11.78-.25.78-.56v-2.12c-3.2.71-3.87-1.4-3.87-1.4-.52-1.36-1.28-1.72-1.28-1.72-1.04-.73.08-.72.08-.72 1.16.08 1.77 1.22 1.77 1.22 1.03 1.8 2.71 1.28 3.37.98.1-.76.4-1.28.73-1.57-2.55-.3-5.24-1.31-5.24-5.82 0-1.29.45-2.34 1.19-3.16-.12-.3-.52-1.51.11-3.12 0 0 .97-.32 3.18 1.2A10.8 10.8 0 0 1 12 5.56c.98.01 1.97.14 2.89.39 2.2-1.52 3.17-1.2 3.17-1.2.63 1.61.23 2.82.11 3.12.74.82 1.19 1.87 1.19 3.16 0 4.52-2.7 5.51-5.27 5.81.41.37.78 1.09.78 2.2v3.14c0 .31.21.68.79.56 4.56-1.52 7.84-5.8 7.84-10.84C23.25 5.6 18.27.5 12 .5Z" />
    </svg>
  );
}

function DiscordIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.32 4.37A19.8 19.8 0 0 0 15.36 2.8a13.7 13.7 0 0 0-.64 1.32 18.4 18.4 0 0 0-5.44 0 13.7 13.7 0 0 0-.64-1.32 19.8 19.8 0 0 0-4.96 1.57C.54 9.1-.32 13.7.1 18.23a19.9 19.9 0 0 0 6.08 3.07c.49-.67.92-1.38 1.29-2.13a12.9 12.9 0 0 1-2.03-.98l.49-.38a14.2 14.2 0 0 0 12.14 0l.49.38c-.65.39-1.33.72-2.03.98.37.75.8 1.46 1.29 2.13a19.9 19.9 0 0 0 6.08-3.07c.5-5.25-.85-9.8-3.58-13.86ZM8.02 15.43c-1.18 0-2.15-1.08-2.15-2.4s.95-2.4 2.15-2.4c1.2 0 2.17 1.09 2.15 2.4 0 1.32-.95 2.4-2.15 2.4Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.4s.95-2.4 2.15-2.4c1.2 0 2.17 1.09 2.15 2.4 0 1.32-.95 2.4-2.15 2.4Z" />
    </svg>
  );
}

function FeatureCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group rounded-[20px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur transition duration-300 hover:border-violet-400/35 hover:bg-white/[0.065] hover:shadow-[0_24px_100px_rgba(99,102,241,0.12)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-1.5 w-10 rounded-full bg-gradient-to-r from-violet-400 to-blue-400 opacity-90" />
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-violet-200/70">
          {eyebrow}
        </span>
      </div>

      <h2 className="text-[19px] font-semibold tracking-tight text-white">
        {title}
      </h2>

      <p className="mt-4 text-[14.5px] leading-7 text-white/56">{children}</p>
    </div>
  );
}

type GitHubRepoStats = {
  stars: number;
  forks: number;
  license: string;
};

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

async function getGitHubRepoStats(): Promise<GitHubRepoStats | null> {
  try {
    const res = await fetch("https://api.github.com/repos/AlphaAvatar/AlphaAvatar", {
      next: {
        revalidate: 3600,
      },
      headers: {
        Accept: "application/vnd.github+json",
      },
    });

    if (!res.ok) return null;

    const repo = await res.json();

    return {
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      license: repo.license?.spdx_id ?? "Apache-2.0",
    };
  } catch {
    return null;
  }
}

function GitHubStats({ stats }: { stats: GitHubRepoStats | null }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-white/56">
      <a
        href="https://github.com/AlphaAvatar/AlphaAvatar"
        target="_blank"
        rel="noreferrer"
        className="group inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-white/[0.045] px-4 py-2 backdrop-blur transition hover:border-violet-400/45 hover:bg-violet-500/10"
      >
        <GitHubIcon className="h-4 w-4 text-white/70 transition group-hover:text-white" />
        <span className="text-yellow-300">★</span>
        <span>
          {stats ? formatCompactNumber(stats.stars) : "Star"} Stars
        </span>
      </a>

      <a
        href="https://github.com/AlphaAvatar/AlphaAvatar/forks"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 backdrop-blur transition hover:border-violet-400/35 hover:bg-white/[0.065]"
      >
        <span className="text-violet-300">⑂</span>
        <span>{stats ? formatCompactNumber(stats.forks) : "Open"} Forks</span>
      </a>

      <a
        href="https://github.com/AlphaAvatar/AlphaAvatar/blob/main/LICENSE"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 backdrop-blur transition hover:border-violet-400/35 hover:bg-white/[0.065]"
      >
        <span className="text-blue-300">◈</span>
        <span>{stats?.license ?? "Apache-2.0"}</span>
      </a>
    </div>
  );
}

function ComparisonTable() {
  const rows = [
    {
      product: "ChatGPT / Claude",
      focus: "General AI chat",
      difference:
        "Excellent general-purpose assistants, but primarily organized around conversation sessions rather than a self-hostable realtime personal avatar runtime.",
      alpha:
        "AlphaAvatar focuses on persistent personal context, realtime voice/vision interaction, memory, persona, tools, and long-term assistant workflows.",
    },
    {
      product: "Claude Code",
      focus: "Coding agent",
      difference:
        "Optimized for software engineering workflows, code editing, repository reasoning, and developer productivity.",
      alpha:
        "AlphaAvatar is broader than coding: it is designed for daily-life assistance, personal workspace integration, reminders, planning, memory, and multimodal interaction.",
    },
    {
      product: "OpenClaw / desktop agents",
      focus: "Local task automation",
      difference:
        "OpenClaw is closer to a self-hosted desktop agent runtime: it runs on local machines, connects to apps and services, maintains persistent memory, and executes tasks such as email, files, browser workflows, scheduling, and messaging automation.",
      alpha:
        "AlphaAvatar focuses on realtime embodied interaction: voice, text, camera/video, avatar presence, persona awareness, runtime context, RAG, MCP tools, and cross-channel personal assistant workflows.",
    },
    {
      product: "Voice avatar demos",
      focus: "Realtime conversation",
      difference:
        "Usually focus on speech, animation, or visual presence, but often lack long-term memory, planning, and tool execution.",
      alpha:
        "AlphaAvatar treats the avatar as a personal runtime: it can talk, see, remember, retrieve, plan, and act through plugins and external tools.",
    },
  ];

  return (
    <section className="mt-10 pb-8">
      <div className="overflow-hidden rounded-[24px] border border-violet-400/18 bg-white/[0.035] shadow-[0_30px_120px_rgba(0,0,0,0.42)] backdrop-blur">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-violet-200/65">
                Where AlphaAvatar fits
              </div>
              <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.035em] text-white">
                A personal assistant runtime, not another chat UI
              </h2>
            </div>

            <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200/80">
              Personal assistant runtime
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-[14.5px] leading-7 text-white/52">
            AlphaAvatar is not a replacement for general chat models, coding agents, or
            desktop automation tools. It focuses on the personal assistant layer:
            realtime multimodal interaction, persistent user context, avatar presence,
            tools, and long-term workflows.
          </p>
        </div>

        <div className="hidden md:block">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.025] text-xs uppercase tracking-[0.16em] text-white/38">
                <th className="w-[18%] px-6 py-4 font-medium">Product</th>
                <th className="w-[18%] px-6 py-4 font-medium">Main focus</th>
                <th className="w-[31%] px-6 py-4 font-medium">Typical strength</th>
                <th className="w-[33%] px-6 py-4 font-medium text-violet-200/75">
                  AlphaAvatar angle
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.product}
                  className="border-b border-white/[0.07] last:border-b-0"
                >
                  <td className="px-6 py-5 align-top text-[14px] font-semibold text-white">
                    {row.product}
                  </td>
                  <td className="px-6 py-5 align-top text-[14px] text-white/58">
                    {row.focus}
                  </td>
                  <td className="px-6 py-5 align-top text-[14px] leading-7 text-white/48">
                    {row.difference}
                  </td>
                  <td className="px-6 py-5 align-top text-[14px] leading-7 text-violet-100/72">
                    {row.alpha}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-4 md:hidden">
          {rows.map((row) => (
            <div
              key={row.product}
              className="rounded-[18px] border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-white">{row.product}</div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/45">
                  {row.focus}
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-white/46">
                {row.difference}
              </p>

              <p className="mt-3 rounded-2xl border border-violet-400/15 bg-violet-500/[0.06] p-3 text-sm leading-6 text-violet-100/72">
                {row.alpha}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const githubStats = await getGitHubRepoStats();
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02040b] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(100,116,255,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,255,0.13)_1px,transparent_1px)] bg-[size:18px_18px]" />

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_50%_16%,rgba(139,92,246,0.12),transparent_24%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1510px] flex-col px-8 py-6">
        <header className="flex h-[76px] items-center justify-between rounded-[14px] border border-indigo-500/25 bg-black/55 px-8 shadow-[0_0_0_1px_rgba(255,255,255,0.025),0_24px_90px_rgba(0,0,0,0.4)] backdrop-blur">
          <AlphaLogo />

          <div className="hidden items-center gap-3 text-sm text-white/60 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]" />
            Self-hostable · Realtime · Personal context
          </div>
        </header>

        <section className="flex min-h-[calc(100vh-118px)] flex-col items-center justify-center px-4 pb-12 pt-6 text-center">
          <div className="mb-5">
            <RotatingNewsPill
              items={HERO_NEWS_ITEMS}
              intervalMs={HERO_NEWS_INTERVAL_MS}
              label="Latest update"
            />
          </div>

          <h1 className="mx-auto max-w-6xl text-[42px] font-bold leading-[1.04] tracking-[-0.055em] text-white sm:text-[56px]">
            Your self-hostable realtime AI assistant for memory, vision, planning, and action
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-[17px] leading-8 text-white/58">
            AlphaAvatar is a personal assistant runtime that can talk, see, remember,
            plan, and act across your workspace, tools, and daily life.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link
              href="/demo"
              className="rounded-[16px] bg-white px-7 py-3.5 font-medium text-black shadow-[0_18px_60px_rgba(255,255,255,0.12),0_0_40px_rgba(139,92,246,0.16)] transition hover:scale-[1.02] hover:opacity-90"
            >
              Try Live Demo
            </Link>

            <a
              href="https://docs.alphaavatar.io"
              className="rounded-[16px] border border-violet-400/25 bg-white/[0.035] px-7 py-3.5 font-medium text-white/90 backdrop-blur transition hover:border-violet-400/45 hover:bg-violet-500/10"
            >
              View Docs
            </a>

            <a
              href="https://discord.gg/g22eMMYrW"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-[16px] border border-[#5865F2]/35 bg-[#5865F2]/10 px-7 py-3.5 font-medium text-white/90 backdrop-blur transition hover:border-[#5865F2]/60 hover:bg-[#5865F2]/18"
            >
              <DiscordIcon className="h-4 w-4 text-white/80" />
              Join Discord
            </a>

            <a
              href="https://github.com/AlphaAvatar/AlphaAvatar"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-[16px] border border-violet-400/25 bg-white/[0.035] px-7 py-3.5 font-medium text-white/90 backdrop-blur transition hover:border-violet-400/45 hover:bg-violet-500/10"
            >
              <GitHubIcon className="h-4 w-4 text-white/75" />
              GitHub
            </a>
          </div>

          <GitHubStats stats={githubStats} />

          <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-2 text-[13px] text-white/42">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-1.5">
              Memory
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-1.5">
              Persona
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-1.5">
              Vision
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-1.5">
              Planning
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-1.5">
              MCP / RAG / DeepResearch
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-1.5">
              Realtime Avatar
            </span>
          </div>
        </section>

        <section className="mt-8">
          <div className="rounded-[24px] border border-violet-400/18 bg-white/[0.035] p-6 text-center shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-violet-200/60">
              Community
            </div>

            <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.035em] text-white">
              Build AlphaAvatar with the community
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-[14.5px] leading-7 text-white/50">
              Join developers, researchers, and builders interested in realtime agents,
              multimodal AI, memory systems, MCP tools, and personal AI assistants.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="https://discord.gg/g22eMMYrW"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#5865F2]/35 bg-[#5865F2]/10 px-5 py-2.5 text-sm font-medium text-white/90 transition hover:border-[#5865F2]/60 hover:bg-[#5865F2]/18"
              >
                <DiscordIcon className="h-4 w-4" />
                Discord Community
              </a>

              <a
                href="https://github.com/AlphaAvatar/AlphaAvatar/discussions"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-violet-400/35 hover:bg-white/[0.065]"
              >
                <GitHubIcon className="h-4 w-4" />
                GitHub Discussions
              </a>
            </div>
          </div>
        </section>

        <section className="mt-8 pb-3">
          <div className="mb-6 text-center">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-violet-200/60">
              Core idea
            </div>

            <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.035em] text-white">
              More than a chat interface
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-[14.5px] leading-7 text-white/48">
              AlphaAvatar connects realtime interaction with persistent context,
              personal memory, tool execution, and long-term assistant workflows.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <FeatureCard eyebrow="Purpose" title="A personal life manager">
              AlphaAvatar is designed to become a long-term AI companion and
              personal operating system that can continuously learn, remember,
              plan, and act for the user.
            </FeatureCard>

            <FeatureCard eyebrow="Runtime" title="Plugin-based Agent system">
              Built around composable Agent plugins for memory, persona,
              reflection, planning, external tools, RAG, DeepResearch, messaging
              channels, and real-time virtual character interaction.
            </FeatureCard>

            <FeatureCard eyebrow="Action" title="From context to execution">
              AlphaAvatar can manage personal knowledge, retrieve notes, track
              life metrics, schedule tasks, call tools, research information, and
              maintain continuity across conversations and modalities.
            </FeatureCard>
          </div>
        </section>

        <ComparisonTable />
      </div>
    </main>
  );
}
