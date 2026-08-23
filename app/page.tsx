"use client";

import Link from "next/link";
import { useState } from "react";
import Chip from "@/components/Chip";
import StatusBadge from "@/components/StatusBadge";
import TypeIcon from "@/components/TypeIcon";
import { SUBJECTS } from "@/lib/data";
import { useItems } from "@/lib/useItems";

export default function DashboardPage() {
  const items = useItems();
  const [subject, setSubject] = useState("All");

  const recent = items.filter((item) => item.status === "reading").slice(0, 3);
  const filtered =
    subject === "All" ? recent : recent.filter((item) => item.subject === subject);

  return (
    <div className="px-5 pt-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Stash<span className="text-primary">.</span>
        </h1>
        <Link
          href="/add"
          className="rounded-full bg-tint px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
        >
          + New
        </Link>
      </header>

      <Link
        href="/search"
        className="mt-6 flex items-center gap-2.5 rounded-xl border border-tint bg-tint-soft px-4 py-3 text-sm text-ink-muted transition-colors hover:border-primary/40"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4.5 w-4.5">
          <path d="m20 20-4.05-4.05M17.5 11a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" strokeLinecap="round" />
        </svg>
        Search your stash…
      </Link>

      <div className="sticky top-0 z-20 -mx-5 mt-7 bg-white px-5 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SUBJECTS.map((label) => (
            <Chip key={label} label={label} active={subject === label} onClick={() => setSubject(label)} />
          ))}
        </div>
      </div>

      <section className="mt-3 pb-4">
        <h2 className="text-base font-semibold text-ink">Pick up where you left off</h2>
        <div className="mt-4 space-y-3">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/item/${item.id}`}
              className="block rounded-xl border border-[#EFEEF6] p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <TypeIcon type={item.type} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
                      {item.title}
                    </h3>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 truncate text-xs text-ink-muted">{item.source}</p>
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="rounded-xl bg-tint-soft p-6 text-center text-sm text-ink-muted">
              Nothing in progress for this subject yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
