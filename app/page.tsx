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
    tags: ["transformer", "attention", "nlp"] as string[],
    status: "to-read" as const,
    summary:
      "The 2017 paper that introduced the Transformer architecture, replacing recurrent neural networks with self-attention mechanisms. This breakthrough enabled parallel processing of sequences, making it possible to train much larger models on more data. The Transformer became the foundation for BERT, GPT, and all modern large language models, revolutionizing natural language processing and AI.",
    keywords: ["transformer", "attention", "nlp", "deep learning"] as string[],
    isExample: true,
    notes: "",
  },
  {
    id: "example-2",
    title: "The Lean Startup — notes",
    url: "",
    type: "note" as const,
    source: "local note",
    subject: "Product",
    tags: ["startup", "mvp", "product"] as string[],
    status: "to-read" as const,
    summary:
      "Eric Ries' methodology for building startups through rapid experimentation. Instead of elaborate business plans, create a minimum viable product (MVP) to test hypotheses with real customers. Use the build-measure-learn loop: build a small feature, measure how users respond, learn whether to pivot or persevere. Validated learning replaces gut feelings, reducing waste and increasing chances of product-market fit.",
    keywords: ["startup", "mvp", "product", "lean"] as string[],
    isExample: true,
    notes: "",
  },
];

type ExampleItem = typeof EXAMPLE_ITEMS[number];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, mergeLocalData, merging } = useAuth();
  const { items, loading: itemsLoading, refresh } = useLocalItems();
  const [subject, setSubject] = useState("All");
  const [profile, setProfile] = useState<{ name: string; email: string; avatarUrl: string } | null>(null);
  const [sampleAdded, setSampleAdded] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const isLoading = authLoading || itemsLoading;
  const isSignedOut = !authLoading && !user;
  const hasRealItems = items.length > 0;
  const showOnboarding = isSignedOut && !hasRealItems && !sampleAdded;
  const showNudge = isSignedOut && !sampleAdded && items.length >= 2 && !nudgeDismissed;
  const isSyncing = merging && !isSignedOut;

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

  useEffect(() => {
    if (!authLoading && user) {
      mergeLocalData().then((result) => {
        console.log("[dashboard] Merge result:", result);
      });
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!authLoading) {
      const dismissed = sessionStorage.getItem("nudgeDismissed");
      if (dismissed) setTimeout(() => setNudgeDismissed(true), 0);
    }
  }, [authLoading]);

  useEffect(() => {
    if (!authLoading && user) {
      // User just signed in - the auth context will handle the merge
    }
  }, [authLoading, user]);

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
    await addItem(SAMPLE_ITEM);
    setSampleAdded(true);
    refresh();
  };

  const handleAddExample = async (example: ExampleItem) => {
    await addItem({
      title: example.title,
      url: example.url,
      type: example.type,
      subject: example.subject,
      tags: example.tags,
      status: example.status,
      summary: example.summary,
      notes: example.notes,
      keywords: example.keywords,
    });
    setSampleAdded(true);
    refresh();
  };

  const handleDismissNudge = () => {
    setNudgeDismissed(true);
    sessionStorage.setItem("nudgeDismissed", "true");
  };

  return (
    <div className="px-5 pt-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Stash<span className="text-primary">.</span>
        </h1>

        <div className="flex items-center gap-2.5">
          {isSignedOut && (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-7 0h4m-7 0l5-5m0 0l5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-semibold">Sign in</span>
            </Link>
          )}
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

      {isSignedOut && (
        <p className="mt-1 text-xs text-ink-muted text-center text-ink-muted/70">
          Saved on this device — sign in to keep them everywhere
        </p>
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
            Or tap an example below to add it to your stash.
          </p>

          <div className="space-y-3">
            {EXAMPLE_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleAddExample(item)}
                className="block w-full text-left rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/10"
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
              </button>
            ))}
          </div>
        </div>
      )}

      {showNudge && (
        <div className="mt-6 rounded-xl bg-primary/5 border border-primary/10 p-4">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-ink">Keep your stash safe</p>
              <p className="mt-1 text-sm text-ink-secondary">
                You&apos;ve saved 2 items. Sign in to keep them and reach your stash on any device.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Link
                href="/login"
                className="flex-1 rounded-xl bg-primary py-2 px-4 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark text-center"
              >
                Continue with Google
              </Link>
              <button
                onClick={handleDismissNudge}
                className="rounded-xl border border-[#E5E3F0] bg-white px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-tint-soft hover:text-primary"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-20 -mx-5 mt-7 bg-white px-5 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((label) => (
            <Chip key={label} label={label} active={subject === label} onClick={() => setSubject(label)} />
          ))}
        </div>
      </div>

      {isSyncing && (
        <div className="mt-3 px-5">
          <div className="flex items-center justify-center gap-2 text-xs text-ink-muted bg-tint-soft rounded-xl py-2">
            <svg className="animate-spin h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Syncing your saved items…</span>
          </div>
        </div>
      )}

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