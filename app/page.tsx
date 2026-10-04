"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Chip from "@/components/Chip";
import StatusBadge from "@/components/StatusBadge";
import TypeIcon from "@/components/TypeIcon";
import { displaySource } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { addItem, useLocalItems } from "@/lib/storage";

const SAMPLE_ITEM = {
  title: "How Large Language Models Work",
  url: "https://en.wikipedia.org/wiki/Large_language_model",
  type: "article" as const,
  subject: "AI",
  tags: ["AI", "LLM", "transformer"],
  summary:
    "A clear overview of large language models — how they're trained on huge amounts of text to predict the next word, why scale makes them capable, and where they fall short. Covers tokens, training data, and real-world uses from chatbots to code. A solid starting point for understanding what powers tools like ChatGPT and Claude.",
  keywords: ["LLM", "machine learning", "neural networks", "AI", "transformers"],
  status: "to-read" as const,
  notes: "",
};

const EXAMPLE_ITEMS = [
  {
    id: "example-1",
    title: "Attention Is All You Need",
    url: "https://arxiv.org/abs/1706.03762",
    type: "article" as const,
    source: "arxiv.org",
    subject: "AI",
    tags: ["transformer", "attention", "nlp"],
    status: "to-read" as const,
    summary: "The seminal paper introducing the Transformer architecture, replacing recurrence with self-attention for sequence modeling.",
    keywords: ["transformer", "attention", "nlp"],
    isExample: true,
  },
  {
    id: "example-2",
    title: "The Lean Startup — notes",
    url: "https://example.com/lean-startup-notes",
    type: "pdf" as const,
    source: "local.pdf",
    subject: "Product",
    tags: ["startup", "mvp", "product"],
    status: "reading" as const,
    summary: "Key takeaways from Eric Ries' Lean Startup methodology: build-measure-learn loop, validated learning, and pivot vs persevere decisions.",
    keywords: ["startup", "mvp", "product"],
    isExample: true,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, loading: itemsLoading, refresh } = useLocalItems();
  const [subject, setSubject] = useState("All");
  const [profile, setProfile] = useState<{ name: string; email: string; avatarUrl: string } | null>(null);
  const [sampleAdded, setSampleAdded] = useState(false);

  const isLoading = authLoading || itemsLoading;
  const isSignedOut = !authLoading && !user;
  const hasRealItems = items.length > 0;
  const showOnboarding = isSignedOut && !hasRealItems && !sampleAdded;

  useEffect(() => {
    if (!authLoading && !itemsLoading && user) {
      const meta = user.user_metadata as Record<string, string>;
      const name = meta.full_name || meta.name || "";
      const email = user.email ?? "";
      const avatarUrl = (meta.avatar_url || meta.picture || "") as string;
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

  const handleTrySample = async () => {
    const newId = await addItem(SAMPLE_ITEM);
    if (newId) {
      router.push(`/item/${newId}`);
    } else {
      setSampleAdded(true);
      refresh();
    }
  };

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

      {showOnboarding && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-ink">Welcome to Stash!</p>
            </div>
            <p className="text-sm text-ink-secondary mb-4">
              Try adding a sample item to see how Stash works. It&apos;s instant and works offline.
            </p>
            <button
              onClick={handleTrySample}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark"
            >
              Try a sample
            </button>
          </div>

          <p className="text-xs text-ink-muted text-center">
            Or browse the examples below to see how items look.
          </p>

          <div className="space-y-3">
            {EXAMPLE_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={`/item/${item.id}`}
                className="block rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <TypeIcon type={item.type} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
                        {item.title}
                      </h3>
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Example
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-ink-muted">{item.source}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
              {visible.length === 0 && !showOnboarding && (
                <div className="rounded-xl bg-tint-soft p-8 text-center">
                  <p className="text-sm font-medium text-ink">
                    {subject === "All" ? "Nothing saved yet" : `Nothing saved under ${subject} yet`}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Tap + New to add your first link, PDF or note.
                  </p>
                </div>
              )}
              {sampleAdded && (
                <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-center">
                  <p className="text-sm font-medium text-primary">That&apos;s it — now add your own.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}