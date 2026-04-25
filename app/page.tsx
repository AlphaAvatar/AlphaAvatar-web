import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <div className="mb-6 rounded-full border border-white/20 px-4 py-1 text-sm text-white/70">
          AlphaAvatar
        </div>

        <h1 className="max-w-5xl text-5xl font-bold tracking-tight sm:text-6xl">
          A real-time personal AI avatar that learns, remembers, and acts
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-white/70">
          AlphaAvatar is an open, self-hostable platform for building persistent
          AI avatars with voice, memory, persona, tools, and multi-channel
          interaction.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/demo"
            className="rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:opacity-90"
          >
            Try Live Demo
          </Link>

          <a
            href="https://docs.alphaavatar.io"
            className="rounded-xl border border-white/20 px-6 py-3 font-medium text-white transition hover:bg-white/5"
          >
            View Docs
          </a>

          <a
            href="https://github.com/AlphaAvatar/AlphaAvatar"
            className="rounded-xl border border-white/20 px-6 py-3 font-medium text-white transition hover:bg-white/5"
          >
            GitHub
          </a>
        </div>
      </section>

      <section className="mx-auto mt-6 grid max-w-6xl gap-4 px-6 pb-20 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Realtime Avatar</h2>
          <p className="mt-3 text-sm text-white/60">
            Talk to AlphaAvatar through low-latency voice and avatar interaction
            designed for continuous conversation.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Memory + Persona</h2>
          <p className="mt-3 text-sm text-white/60">
            Create assistants that remember context, understand users over time,
            and deliver more personal interactions.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Tools + Channels</h2>
          <p className="mt-3 text-sm text-white/60">
            Connect external tools, knowledge, and messaging channels to turn
            AlphaAvatar into a true personal AI system.
          </p>
        </div>
      </section>
    </main>
  );
}
