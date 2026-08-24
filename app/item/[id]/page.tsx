"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import TypeIcon from "@/components/TypeIcon";
import { STATUS_LABELS, displaySource, type Status } from "@/lib/data";
import { deleteItem, updateItem, useItems } from "@/lib/useItems";

interface Draft {
  id: string;
  status: Status;
  notes: string;
}

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { items, loading, refresh } = useItems();
  const item = items.find((it) => it.id === params.id);

  const [draft, setDraft] = useState<Draft>({ id: "", status: "to-read", notes: "" });
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (item && draft.id !== item.id) {
    setDraft({ id: item.id, status: item.status, notes: item.notes ?? "" });
  }
  const status = draft.status;
  const notes = draft.notes;

  if (loading) {
    return (
      <div className="px-5 pt-8">
        <div className="h-8 w-24 animate-pulse rounded-lg bg-tint-soft" />
        <div className="mt-6 h-24 animate-pulse rounded-xl bg-tint-soft" />
      </div>
    );
  }

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

  async function handleStatusChange(value: Status) {
    setDraft((d) => ({ ...d, status: value }));
    await updateItem(item!.id, { status: value });
    refresh();
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    await updateItem(item!.id, { notes });
    setSavingNotes(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
    refresh();
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
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 truncate text-sm font-medium text-primary hover:underline"
            >
              {displaySource(item.url)}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 shrink-0">
                <path d="M7 17 17 7m0 0H9m8 0v8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {item.summary && (
        <section className="mt-6 rounded-xl bg-tint-soft p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Summary</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink">{item.summary}</p>
        </section>
      )}

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
            My notes
          </label>
          {notesSaved && <span className="text-xs font-medium text-primary">Saved ✓</span>}
        </div>
        <textarea
          id="notes"
          rows={5}
          value={notes}
          onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
          placeholder="Add your own notes here…"
          className="mt-2 w-full resize-none rounded-xl border border-[#E5E3F0] bg-white px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={handleSaveNotes}
          disabled={savingNotes}
          className="mt-2 rounded-xl bg-tint px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-60"
        >
          {savingNotes ? "Saving…" : "Save notes"}
        </button>
      </section>

      {item.tags.length > 0 && (
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
      )}

      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Status</h2>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-tint-soft p-1">
          {(Object.entries(STATUS_LABELS) as [Status, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => handleStatusChange(value)}
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
        onConfirm={async () => {
          setConfirmOpen(false);
          await deleteItem(item.id);
          router.push("/library");
        }}
      />
    </div>
  );
}
