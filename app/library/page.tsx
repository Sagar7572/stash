"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Chip from "@/components/Chip";
import ConfirmDialog from "@/components/ConfirmDialog";
import StatusBadge from "@/components/StatusBadge";
import TypeIcon from "@/components/TypeIcon";
import { STATUS_LABELS, displaySource, type Item, type Status } from "@/lib/data";
import { deleteItem, useLocalItems } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";

const filters: ("all" | Status)[] = ["all", "to-read", "reading", "done"];

export default function LibraryPage() {
  const { items, loading, refresh } = useLocalItems();
  const { merging, user, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null);
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      const flag = localStorage.getItem("stash_has_account");
      setHasAccount(flag === "1");
    }
  }, [authLoading]);

  const visible =
    filter === "all" ? items : items.filter((item) => item.status === filter);
  const isSyncing = merging;
  const isSignedOut = !authLoading && !user;

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Library</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        {loading ? "Loading…" : `${items.length} saved item${items.length === 1 ? "" : "s"}`}
      </p>

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

      <div className="sticky top-0 z-20 -mx-5 mt-4 bg-white px-5 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((value) => (
            <Chip
              key={value}
              label={value === "all" ? "All" : STATUS_LABELS[value]}
              active={filter === value}
              onClick={() => setFilter(value)}
            />
          ))}
        </div>
      </div>

      <ul className="mt-4 space-y-3 pb-4">
        {loading &&
          [0, 1, 2].map((i) => (
            <li key={i} className="h-[86px] animate-pulse rounded-xl bg-tint-soft" />
          ))}

        {!loading &&
          visible.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-1 rounded-xl border border-[#EFEEF6] p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <Link href={`/item/${item.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <TypeIcon type={item.type} />
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 text-sm font-semibold text-ink">{item.title}</h3>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">
                    {displaySource(item.url)}
                  </p>
                  <span className="mt-1.5 inline-block rounded-full bg-tint-soft px-2 py-0.5 text-[10px] font-medium text-ink-secondary">
                    {item.subject}
                  </span>
                </div>
                <StatusBadge status={item.status} />
              </Link>
              <button
                type="button"
                aria-label={`Delete ${item.title}`}
                onClick={() => setPendingDelete(item)}
                className="shrink-0 p-1.5 text-ink-muted transition-colors hover:text-primary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4.5 w-4.5">
                  <path
                    d="M4 7h16M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2m3.5 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7M10 11v6m4-6v6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </li>
          ))}

        {!loading && visible.length === 0 && (
          <li className="rounded-xl bg-tint-soft p-8 text-center">
            {hasAccount && isSignedOut && filter === "all" ? (
              <>
                <p className="text-sm font-medium text-ink">Your saved items are in your account.</p>
                <p className="mt-1 text-xs text-ink-muted">Sign in to see them.</p>
                <button
                  onClick={() => window.location.href = "/login"}
                  className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-ink">Nothing here yet</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Tap the + button to add your first item.
                </p>
              </>
            )}
          </li>
        )}
      </ul>

      <ConfirmDialog
        open={pendingDelete !== null}
        message="Delete this item?"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) await deleteItem(pendingDelete.id);
          setPendingDelete(null);
          refresh();
        }}
      />
    </div>
  );
}