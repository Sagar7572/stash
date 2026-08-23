"use client";

import { useState } from "react";
import { STATUS_LABELS, type Status } from "@/lib/data";

const statusOptions = Object.entries(STATUS_LABELS) as [Status, string][];

const inputClass =
  "w-full rounded-xl border border-[#E5E3F0] bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-secondary";

export default function AddItemPage() {
  const [status, setStatus] = useState<Status>("to-read");

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Add to Stash</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        Paste a link or jot down a note — organize it later.
      </p>

      <form className="mt-7 space-y-5 pb-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="url" className={labelClass}>
            URL
          </label>
          <input
            id="url"
            type="url"
            placeholder="https://…"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input id="title" type="text" placeholder="Give it a name" className={inputClass} />
        </div>

        <div>
          <label htmlFor="summary" className={labelClass}>
            Summary
          </label>
          <textarea
            id="summary"
            rows={3}
            placeholder="What is this about?"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label htmlFor="subject" className={labelClass}>
            Subject
          </label>
          <select id="subject" defaultValue="" className={`${inputClass} appearance-none`}>
            <option value="" disabled>
              Choose a subject
            </option>
            <option>DBMS</option>
            <option>Strategy</option>
            <option>Marketing</option>
          </select>
        </div>

        <div>
          <label htmlFor="tags" className={labelClass}>
            Tags
          </label>
          <input id="tags" type="text" placeholder="exam-prep, frameworks…" className={inputClass} />
        </div>

        <div>
          <span className={labelClass}>Status</span>
          <div className="flex gap-2">
            {statusOptions.map(([value, label]) => (
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

        <button
          type="submit"
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark"
        >
          Save to Stash
        </button>
      </form>
    </div>
  );
}
