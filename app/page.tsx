"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Chip from "@/components/Chip";
import StatusBadge from "@/components/StatusBadge";
import TypeIcon from "@/components/TypeIcon";
import { displaySource } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { fetchItems, fetchSubjects, useLocalItems } from "@/lib/storage";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, loading: itemsLoading, refresh } = useLocalItems();
  const [subject, setSubject] = useState("All");
  const [profile, setProfile] = useState<{ name: string; email: string; avatarUrl: string } | null>(null);

  const isLoading = authLoading || itemsLoading;

  useEffect(() => {
    if (!authLoading && !itemsLoading && user) {
      const meta = user.user_metadata as Record<string, string>;
      const name = meta.full_name || meta.name || "";
      const email = user.email ?? "";
      const avatarUrl = (meta.avatar_url || meta.picture || "") as string;
      // Defer setProfile to avoid synchronous setState in effect
      setTimeout(() => {
        setProfile({ name, email, avatarUrl });
      }, 0);
    }
  }, [authLoading, itemsLoading, user]);

  const emailPrefix = profile?.email.split("@")[0] ?? "";
  const firstName = profile?.name ? profile.name.trim().split(/\s+/)[0] : emailPrefix;
  const initial = (firstName[0] ?? "").toUpperCase();
  const avatarUrl = profile?.avatarUrl ?? "";

  const subjects = [...new Set(items.map((item) => item.subject).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
  );
  const filters = ["All", ...subjects];

  const visible = subject === "All" ? items : items.filter((item) => item.subject === subject);

  return (
    <div className="px-5 pt-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Stash<span className="text-primary">.</span>
        </h1>

        <div className="flex items-center gap-2.5">
          {firstName && (
            <p className="text-[13px] font-medium">
              <span className="hidden min-[360px]:inline text-ink-secondary">Hi, </span>
              <span className="text-primary">{firstName}</span>
            </p>
          )}
          <Link href="/profile" aria-label="Go to profile" className="shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tint text-sm font-semibold text-[#534AB7]">
                {initial || "S"}
              </span>
            )}
          </Link>
        </div>
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
          {filters.map((label) => (
            <Chip key={label} label={label} active={subject === label} onClick={() => setSubject(label)} />
          ))}
        </div>
      </div>

      <section className="mt-3 pb-4">
        <h2 className="text-base font-semibold text-ink">Your stash</h2>
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <>
              <div className="h-20 animate-pulse rounded-xl bg-tint-soft" />
              <div className="h-20 animate-pulse rounded-xl bg-tint-soft" />
            </>
          ) : (
            <>
              {visible.map((item) => (
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
                      <p className="mt-1 truncate text-xs text-ink-muted">
                        {displaySource(item.url)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {visible.length === 0 && (
                <div className="rounded-xl bg-tint-soft p-8 text-center">
                  <p className="text-sm font-medium text-ink">
                    {subject === "All" ? "Nothing saved yet" : `Nothing saved under ${subject} yet`}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Tap + New to add your first link, PDF or note.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}