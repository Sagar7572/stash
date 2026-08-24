"use client";

import Link from "next/link";
import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import TypeIcon from "@/components/TypeIcon";
import { displaySource } from "@/lib/data";
import { useItems } from "@/lib/useItems";

export default function SearchPage() {
  const { items, loading } = useItems();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const results =
    q.length === 0
      ? items
      : items.filter((item) =>
          [
            item.title,
            item.subject,
            item.summary,
            displaySource(item.url),
            ...item.tags,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q)
        );

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Search</h1>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search titles, tags, subjects…"
        className="mt-6 w-full rounded-xl border border-[#E5E3F0] bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      <ul className="mt-6 space-y-3 pb-4">
        {loading &&
          [0, 1].map((i) => (
            <li key={i} className="h-[76px] animate-pulse rounded-xl bg-tint-soft" />
          ))}

        {!loading &&
          results.map((item) => (
            <li key={item.id}>
              <Link
                href={`/item/${item.id}`}
                className="flex items-center gap-3 rounded-xl border border-[#EFEEF6] p-4 shadow-sm transition-shadow hover:shadow-md"
              >
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
            </li>
          ))}

        {!loading && results.length === 0 && (
          <li className="rounded-xl bg-tint-soft p-8 text-center">
            <p className="text-sm font-medium text-ink">
              {q ? `No matches for “${query.trim()}”` : "Your stash is empty"}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {q
                ? "Try a different title, tag or subject."
                : "Tap + to save your first item."}
            </p>
          </li>
        )}
      </ul>
    </div>
  );
}
