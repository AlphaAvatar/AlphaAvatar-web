import Link from "next/link";

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
        <span className="text-yellow-300 transition group-hover:scale-110">
          ★
        </span>
        <span>
          {stats ? formatCompactNumber(stats.stars) : "Star"} GitHub Stars
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
            Self-hostable · Privacy-first · Omni-avatar
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-center px-4 pb-5 pt-6 text-center">
          <h1 className="mx-auto max-w-6xl text-[42px] font-bold leading-[1.04] tracking-[-0.055em] text-white sm:text-[60px]">
            Your self-hostable AI avatar for memory, planning, and action
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-[17px] leading-8 text-white/58">
            AlphaAvatar is an Omni-Avatar personal assistant framework that evolves
            into your intelligent personal butler — learning, remembering, and acting
            on your behalf.
          </p>

          <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-2.5 text-sm text-white/56">
            <span className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2">
              🧠 Full-modality Memory
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2">
              🧬 Dynamic Persona
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2">
              💡 Reflection
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2">
              📅 Planning & Execution
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2">
              🧰 MCP / RAG / DeepResearch / Skills / ...
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2">
              😊 Realtime Avatar
            </span>
          </div>

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
              href="https://github.com/AlphaAvatar/AlphaAvatar"
              className="rounded-[16px] border border-violet-400/25 bg-white/[0.035] px-7 py-3.5 font-medium text-white/90 backdrop-blur transition hover:border-violet-400/45 hover:bg-violet-500/10"
            >
              GitHub
            </a>
          </div>

          <GitHubStats stats={githubStats} />
        </section>

        <section className="grid gap-5 pb-2 md:grid-cols-3">
          <FeatureCard eyebrow="Vision" title="A personal life manager">
            AlphaAvatar is not just a chatbot. It is designed to become a
            long-term AI companion and personal operating system that can
            continuously learn, remember, plan, and act for the user.
          </FeatureCard>

          <FeatureCard eyebrow="Architecture" title="Plugin-based Agent system">
            Built around composable Agent plugins for memory, persona,
            reflection, planning, external tools, RAG, DeepResearch, messaging
            channels, and real-time virtual character interaction.
          </FeatureCard>

          <FeatureCard eyebrow="Capability" title="From context to execution">
            AlphaAvatar can manage personal knowledge, retrieve notes, track
            life metrics, schedule tasks, call tools, research information, and
            maintain continuity across conversations and modalities.
          </FeatureCard>
        </section>
      </div>
    </main>
  );
}
