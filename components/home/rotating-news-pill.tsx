"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { HeroNewsItem } from "@/app/config/hero-news";

type RotatingNewsPillProps = {
  items: HeroNewsItem[];
  intervalMs?: number;
  label?: string;
};

export default function RotatingNewsPill({
  items,
  intervalMs = 4500,
  label = "Now in AlphaAvatar",
}: RotatingNewsPillProps) {
  const safeItems = useMemo(() => items.filter(Boolean), [items]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (safeItems.length <= 1) return;

    const timer = window.setInterval(() => {
      setVisible(false);

      const switchTimer = window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % safeItems.length);
        setVisible(true);
      }, 180);

      return () => window.clearTimeout(switchTimer);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [safeItems.length, intervalMs]);

  if (!safeItems.length) return null;

  const current = safeItems[index];

  const content = (
    <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-4 py-2 text-sm text-violet-100/78 shadow-[0_0_40px_rgba(139,92,246,0.12)] backdrop-blur transition hover:border-violet-400/35 hover:bg-violet-500/[0.11]">
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-[12px] shadow-[0_0_16px_rgba(249,115,22,0.24)]">
        {current.icon ?? "🔥"}
      </span>

      <span className="shrink-0 text-white/45">{label}</span>

      <span
        className={`truncate text-white/80 transition duration-200 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
      >
        {current.text}
      </span>
    </div>
  );

  if (current.href) {
    if (current.external) {
      return (
        <a href={current.href} target="_blank" rel="noreferrer">
          {content}
        </a>
      );
    }

    return <Link href={current.href}>{content}</Link>;
  }

  return content;
}
