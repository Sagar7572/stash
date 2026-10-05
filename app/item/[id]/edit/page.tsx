"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SubjectCombobox from "@/components/SubjectCombobox";
import KeywordChips from "@/components/KeywordChips";
import { updateItem, fetchSubjects } from "@/lib/storage";
import { STATUS_LABELS, type ItemType, type Status } from "@/lib/data";
import Link from "next/link";

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith("http://") || url.startsWith("https://");
  } catch {
    return false;
  }
}

const inputClass =
  "w-full rounded-xl border border-[#E5E3F0] bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary";

const typeOptions: { value: ItemType; label: string }[] = [
  { value: "article", label: "Article" },
  { value: "pdf", label: "PDF" },
  { value: "note", label: "Note" },
];

interface EditItemPageProps {
  params: Promise<{ id: string }>;
}

export default function EditItemPage({ params }: EditItemPageProps) {
  const router = useRouter();
  const [item, setItem] = useState<{
    id: string;
    title: string;
    url: string;
    type: ItemType;
    subject: string;
    tags: string[];
    status: Status;
    summary: string;
    notes: string;
    keywords: string[];
  } | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summarising, setSummarising] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    params.then(async ({ id }) => {
      const res = await fetch(`/api/item/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (!cancelled) {
          setItem({
            id: data.id,
            title: data.title,
            url: data.url,
            type: data.type,
            subject: data.subject,
            tags: data.tags,
            status: data.status,
            summary: data.summary,
            notes: data.notes,
            keywords: data.keywords,
          });
          if (data.keywords?.length) setKeywords(data.keywords);
        }
      }
    });
    return () => { cancelled = true; };
  }, [params]);

  useEffect(() => {
    let cancelled = false;
    fetchSubjects().then((result) => {
      if (!cancelled) setSubjects(result);
    });
    return () => { cancelled = true; };
  }, []);

  async function handleSummarise(url: string) {
    if (!url || !isValidUrl(url)) {
      setSummaryError("That doesn't look like a valid link. Check the URL and try again.");
      return;
    }
    setSummarising(true);
    setSummaryError(null);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        const userMsg = data.userMessage || data.error || "Summarization failed";
        throw new Error(userMsg);
      }

      if (data.summary) {
        const summaryEl = document.getElementById("summary") as HTMLTextAreaElement;
        if (summaryEl) summaryEl.value = data.summary;
        setItem((prev) => prev ? { ...prev, summary: data.summary } : null);
      }
      if (data.keywords?.length) {
        setKeywords(data.keywords);
        setItem((prev) => prev ? { ...prev, keywords: data.keywords } : null);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Summarization failed";
      setSummaryError(msg);
    } finally {
      setSummarising(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const tags = String(form.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      await updateItem(item!.id, {
        title: String(form.get("title") ?? "").trim(),
        url: String(form.get("url") ?? "").trim(),
        type: String(form.get("type") ?? "") as ItemType,
        subject: String(form.get("subject") ?? "").trim(),
        tags,
        status: String(form.get("status") ?? "") as Status,
        summary: String(form.get("summary") ?? "").trim(),
        notes: String(form.get("notes") ?? "").trim(),
        keywords,
      });
      router.push(`/item/${item!.id}`);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save changes";
      setError(msg);
      setSaving(false);
    }
  }

  if (!item) {
    return (
      <div className="px-5 pt-8 text-center">
        <div className="h-8 w-24 animate-pulse rounded-lg bg-tint-soft" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-8">
      <header className="flex items-center gap-3">
        <Link
          href={`/item/${item.id}`}
          className="p-1.5 text-ink-muted transition-colors hover:text-primary"
          aria-label="Back to item"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Edit item</h1>
      </header>

      <form className="mt-7 space-y-5 pb-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="url" className={labelClass}>
            URL
          </label>
          <div className="flex gap-2">
            <input
              id="url"
              name="url"
              type="url"
              defaultValue={item.url}
              placeholder="https://…"
              className={`${inputClass} flex-1`}
              onBlur={(e) => handleSummarise(e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                const urlEl = document.getElementById("url") as HTMLInputElement;
                if (urlEl) handleSummarise(urlEl.value);
              }}
              disabled={summarising}
              className="shrink-0 rounded-xl border border-[#E5E3F0] bg-white px-4 py-3 text-sm font-medium text-ink-secondary transition-colors hover:bg-tint-soft disabled:opacity-60"
            >
              {summarising ? "Fetching & summarising…" : "Summarise"}
            </button>
          </div>
          {summaryError && (
            <p className="mt-1.5 text-xs text-red-500">{summaryError}</p>
          )}
        </div>

        <div>
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={item.title}
            placeholder="Give it a name"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="summary" className={labelClass}>
            Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={3}
            defaultValue={item.summary}
            placeholder={summarising ? "Fetching & summarising — can take a few seconds for some sites…" : "What is this about?"}
            className={`${inputClass} resize-none`}
          />
        </div>

        {keywords.length > 0 && (
          <div>
            <label className={labelClass}>Keywords</label>
            <KeywordChips keywords={keywords} onChange={setKeywords} />
          </div>
        )}

        <div>
          <span className={labelClass}>Type</span>
          <div className="flex gap-2">
            {typeOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setItem((prev) => prev ? { ...prev, type: value } : null)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                  item.type === value
                    ? "border-primary bg-tint text-primary"
                    : "border-[#E5E3F0] bg-white text-ink-secondary hover:border-primary/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input type="hidden" name="type" value={item.type} />
        </div>

        <div>
          <label htmlFor="subject" className={labelClass}>
            Subject
          </label>
          <SubjectCombobox name="subject" options={subjects} defaultValue={item.subject} />
        </div>

        <div>
          <label htmlFor="tags" className={labelClass}>
            Tags
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            defaultValue={item.tags.join(", ")}
            placeholder="exam-prep, frameworks…"
            className={inputClass}
          />
        </div>

        <div>
          <span className={labelClass}>Status</span>
          <div className="flex gap-2">
            {(Object.entries(STATUS_LABELS) as [Status, string][]).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setItem((prev) => prev ? { ...prev, status: value } : null)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                  item.status === value
                    ? "border-primary bg-tint text-primary"
                    : "border-[#E5E3F0] bg-white text-ink-secondary hover:border-primary/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input type="hidden" name="status" value={item.status} />
        </div>

        <div>
          <label htmlFor="notes" className={labelClass}>
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={item.notes}
            placeholder="Your private notes…"
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && (
          <p className="rounded-xl bg-tint p-3 text-sm text-primary">{error}</p>
        )}

        <div className="flex gap-3">
          <Link
            href={`/item/${item.id}`}
            className="flex-1 rounded-xl border border-[#E5E3F0] bg-white py-3.5 text-sm font-semibold text-ink-secondary transition-colors hover:bg-tint-soft hover:text-primary text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}