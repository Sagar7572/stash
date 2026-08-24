"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addItem } from "@/lib/useItems";
import { SUBJECTS, STATUS_LABELS, type ItemType, type Status } from "@/lib/data";

const inputClass =
  "w-full rounded-xl border border-[#E5E3F0] bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary";

const typeOptions: { value: ItemType; label: string }[] = [
  { value: "article", label: "Article" },
  { value: "pdf", label: "PDF" },
  { value: "note", label: "Note" },
];

export default function AddItemPage() {
  const router = useRouter();
  const [type, setType] = useState<ItemType>("article");
  const [status, setStatus] = useState<Status>("to-read");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const tags = String(form.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const err = await addItem({
      title: String(form.get("title") ?? "").trim(),
      url: String(form.get("url") ?? "").trim(),
      type,
      subject: String(form.get("subject") ?? ""),
      tags,
      status,
      summary: String(form.get("summary") ?? "").trim(),
      notes: "",
    });

    if (err) {
      setError(err);
      setSaving(false);
      return;
    }
    router.push("/library");
    router.refresh();
  }

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Add to Stash</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        Paste a link or jot down a note — organize it later.
      </p>

      <form className="mt-7 space-y-5 pb-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="url" className={labelClass}>
            URL
          </label>
          <input id="url" name="url" type="url" placeholder="https://…" className={inputClass} />
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
            placeholder="What is this about?"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <span className={labelClass}>Type</span>
          <div className="flex gap-2">
            {typeOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                  type === value
                    ? "border-primary bg-tint text-primary"
                    : "border-[#E5E3F0] bg-white text-ink-secondary hover:border-primary/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="subject" className={labelClass}>
            Subject
          </label>
          <select id="subject" name="subject" defaultValue="" className={`${inputClass} appearance-none`}>
            <option value="" disabled>
              Choose a subject
            </option>
            {SUBJECTS.map((subject) => (
              <option key={subject}>{subject}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tags" className={labelClass}>
            Tags
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
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
                onClick={() => setStatus(value)}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                  status === value
                    ? "border-primary bg-tint text-primary"
                    : "border-[#E5E3F0] bg-white text-ink-secondary hover:border-primary/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-tint p-3 text-sm text-primary">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save to Stash"}
        </button>
      </form>
    </div>
  );
}
