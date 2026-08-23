"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import TypeIcon from "@/components/TypeIcon";
import { STATUS_LABELS, deleteItem, type Status } from "@/lib/data";
import { useItems } from "@/lib/useItems";

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const items = useItems();
  const item = items.find((it) => it.id === params.id);
  const [status, setStatus] = useState<Status>(item?.status ?? "to-read");
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!item) {
    return (
      <div className="px-5 pt-8 text-center">
        <h1 className="text-xl font-bold text-ink">Item not found</h1>
        <Link href="/library" className="mt-3 inline-block text-sm font-semibold text-primary">
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8">
      <Link
        href="/library"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Library
      </Link>

      <div className="mt-5 flex items-start gap-3">
        <TypeIcon type={item.type} />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold leading-snug tracking-tight text-ink">{item.title}</h1>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 truncate text-sm font-medium text-primary hover:underline"
          >
            {item.source}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 shrink-0">
              <path d="M7 17 17 7m0 0H9m8 0v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      <section className="mt-6 rounded-xl bg-tint-soft p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Summary</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink">{item.summary}</p>
      </section>

      <section className="mt-6">
        <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
          My notes
        </label>
        <textarea
          id="notes"
          rows={5}
          defaultValue={item.notes}
          placeholder="Add your own notes here…"
          className="mt-2 w-full resize-none rounded-xl border border-[#E5E3F0] bg-white px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </section>

      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Tags</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-tint px-3 py-1 text-xs font-medium text-primary"
            >
              #{tag}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Status</h2>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-tint-soft p-1">
          {(Object.entries(STATUS_LABELS) as [Status, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                status === value ? "bg-primary text-white shadow-sm" : "text-ink-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10 pb-4 border-t border-tint pt-5">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
            <path
              d="M4 7h16M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2m3.5 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7M10 11v6m4-6v6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Delete this item
        </button>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        message="Delete this item?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteItem(item.id);
          router.push("/library");
        }}
      />
    </div>
  );
}
