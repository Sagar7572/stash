"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import StatusBadge from "@/components/StatusBadge";
import TypeIcon from "@/components/TypeIcon";
import { displaySource } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { getLocalItems } from "@/lib/storage";

interface SearchResult {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
  url: string;
  type: "article" | "pdf" | "note";
  subject: string;
  status: "to-read" | "reading" | "done";
  created_at: string;
  matches: Array<{ field: string; snippet: string }>;
}

function highlightWord(text: string, query: string): React.ReactNode {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return text;

  const regex = new RegExp(`(\\b\\w*${lowerQuery}\\w*\\b)`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, idx) =>
        regex.test(part) ? (
          <mark key={idx} className="bg-primary/15 text-primary px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function makeSummarySnippet(summary: string, query: string): string {
  const lowerQuery = query.toLowerCase().trim();
  const lowerSummary = summary.toLowerCase();
  const idx = lowerSummary.indexOf(lowerQuery);
  if (idx === -1) return summary.slice(0, 160) + (summary.length > 160 ? "…" : "");

  const wordsBefore = 6;
  const wordsAfter = 8;
  const beforeText = summary.slice(0, idx).trim().split(/\s+/).slice(-wordsBefore).join(" ");
  const afterText = summary.slice(idx + query.length).trim().split(/\s+/).slice(0, wordsAfter).join(" ");

  let snippet = "";
  if (beforeText) snippet += beforeText + " ";
  snippet += summary.slice(idx, idx + query.length);
  if (afterText) snippet += " " + afterText;

  if (idx > beforeText.length + 1) snippet = "…" + snippet;
  if (idx + query.length + afterText.length < summary.length - 1) snippet += "…";

  return snippet;
}

function highlightSummarySnippet(text: string, query: string): React.ReactNode {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return text;

  const parts = text.split(new RegExp(`(${lowerQuery})`, "i"));
  if (parts.length < 3) return text;

  return (
    <>
      {parts[0]}
      <mark className="bg-primary/15 text-primary px-0.5 rounded">{parts[1]}</mark>
      {parts[2]}
    </>
  );
}

function makeKeywordsSnippet(keywords: string[], query: string): string {
  const lowerQuery = query.toLowerCase().trim();
  const matched = keywords.filter(k => k.toLowerCase().includes(lowerQuery));
  if (!matched.length) return "";
  return matched.join(", ");
}

function highlightKeywordsSnippet(text: string, query: string): React.ReactNode {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return text;

  const parts = text.split(new RegExp(`(${lowerQuery})`, "i"));
  if (parts.length < 3) return text;

  return (
    <>
      {parts[0]}
      <mark className="bg-primary/15 text-primary px-0.5 rounded">{parts[1]}</mark>
      {parts[2]}
    </>
  );
}

function searchLocalItems(query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  const items = getLocalItems();
  const words = lowerQuery.split(/\s+/).filter(Boolean);

  return items
    .map((item) => {
      const matches: Array<{ field: string; snippet: string }> = [];

      // Check title
      if (item.title.toLowerCase().includes(lowerQuery)) {
        matches.push({ field: "title", snippet: item.title });
      }

      // Check summary
      if (item.summary?.toLowerCase().includes(lowerQuery)) {
        // Extract snippet around the match
        const idx = item.summary.toLowerCase().indexOf(lowerQuery);
        const start = Math.max(0, idx - 50);
        const end = Math.min(item.summary.length, idx + lowerQuery.length + 110);
        let snippet = item.summary.slice(start, end);
        if (start > 0) snippet = "…" + snippet;
        if (end < item.summary.length) snippet = snippet + "…";
        matches.push({ field: "summary", snippet });
      }

      // Check keywords
      if (item.keywords?.some((k: string) => k.toLowerCase().includes(lowerQuery))) {
        const matchedKeywords = item.keywords
          .filter((k: string) => k.toLowerCase().includes(lowerQuery))
          .join(", ");
        matches.push({ field: "keywords", snippet: matchedKeywords });
      }

      if (matches.length === 0) return null;

      return {
        id: item.id,
        title: item.title,
        summary: item.summary,
        keywords: item.keywords,
        url: item.url,
        type: item.type,
        subject: item.subject,
        status: item.status,
        created_at: item.created_at,
        matches,
      } as SearchResult;
    })
    .filter((item): item is SearchResult => item !== null)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20);
}

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const cancelledRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setTimeout(() => {
        setResults([]);
        setLoading(false);
      }, 0);
    }
  }, [query]);

  const doLocalSearch = useCallback((searchQuery: string) => {
    cancelledRef.current = false;
    setTimeout(() => setLoading(true), 0);

    try {
      const localResults = searchLocalItems(searchQuery);
      if (!cancelledRef.current) {
        setTimeout(() => setResults(localResults), 0);
      }
    } catch {
      if (!cancelledRef.current) {
        setTimeout(() => setResults([]), 0);
      }
    } finally {
      if (!cancelledRef.current) {
        setTimeout(() => setLoading(false), 0);
      }
    }
  }, []);

  const doRemoteSearch = useCallback(async (searchQuery: string) => {
    cancelledRef.current = false;
    setTimeout(() => setLoading(true), 0);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (!cancelledRef.current) {
        setTimeout(() => setResults(data.results ?? []), 0);
      }
    } catch {
      if (!cancelledRef.current) {
        setTimeout(() => setResults([]), 0);
      }
    } finally {
      if (!cancelledRef.current) {
        setTimeout(() => setLoading(false), 0);
      }
    }
  }, []);

  const doSearch = useCallback((searchQuery: string) => {
    if (!authLoading && !user) {
      doLocalSearch(searchQuery);
    } else {
      doRemoteSearch(searchQuery);
    }
  }, [authLoading, user, doLocalSearch, doRemoteSearch]);

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.trim().length < 3) return;
    doSearch(debouncedQuery);
    return () => {
      cancelledRef.current = true;
    };
  }, [debouncedQuery, doSearch]);

  const isQueryValid = debouncedQuery.trim().length >= 3;

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Search</h1>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search titles, summaries, keywords…"
        className="mt-6 w-full rounded-xl border border-[#E5E3F0] bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      <ul className="mt-6 space-y-3 pb-4">
        {loading &&
          [0, 1].map((i) => (
            <li key={i} className="h-[76px] animate-pulse rounded-xl bg-tint-soft" />
          ))}

        {!loading && !debouncedQuery.trim() && (
          <li className="rounded-xl bg-tint-soft p-8 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="mx-auto h-8 w-8 text-ink-muted">
              <path d="m20 20-4.05-4.05M17.5 11a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" strokeLinecap="round" />
            </svg>
            <p className="mt-4 text-sm font-medium text-ink">Search your stash</p>
            <p className="mt-1 text-xs text-ink-muted">Type to find titles, summaries, or keywords</p>
          </li>
        )}

        {!loading && debouncedQuery.trim() && debouncedQuery.trim().length < 3 && (
          <li className="rounded-xl bg-tint-soft p-8 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="mx-auto h-8 w-8 text-ink-muted">
              <path d="m20 20-4.05-4.05M17.5 11a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" strokeLinecap="round" />
            </svg>
            <p className="mt-4 text-sm font-medium text-ink">Type at least 3 characters</p>
            <p className="mt-1 text-xs text-ink-muted">Search works with 3 or more characters</p>
          </li>
        )}

        {!loading && isQueryValid &&
          results.map((item) => (
            <li key={item.id}>
              <Link
                href={`/item/${item.id}`}
                className="flex items-start gap-3 rounded-xl border border-[#EFEEF6] p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <TypeIcon type={item.type} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-ink">
                    {highlightWord(item.title, query)}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">
                    {displaySource(item.url)}
                  </p>
                  <span className="mt-1.5 inline-block rounded-full bg-tint-soft px-2 py-0.5 text-[10px] font-medium text-ink-secondary">
                    {item.subject}
                  </span>

                  {item.matches.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {item.matches.map((match, idx) => {
                        const isSummary = match.field === "summary";
                        const isKeywords = match.field === "keywords";
                        const snippet = isSummary ? makeSummarySnippet(match.snippet, query) : match.snippet;
                        if (isSummary) {
                          return (
                            <span key={idx} className="inline-flex items-center gap-1 text-xs text-ink-secondary">
                              <span className="font-medium text-primary">summary:</span>{" "}
                              {highlightSummarySnippet(snippet, query)}
                            </span>
                          );
                        }
                        if (isKeywords) {
                          const kwSnippet = makeKeywordsSnippet(item.keywords, query);
                          return (
                            <span key={idx} className="inline-flex items-center gap-1 text-xs text-ink-secondary">
                              <span className="font-medium text-primary">keywords:</span>{" "}
                              {kwSnippet ? highlightKeywordsSnippet(kwSnippet, query) : null}
                            </span>
                          );
                        }
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-full bg-tint px-2 py-0.5 text-[10px] font-medium text-primary"
                          >
                            <span className="uppercase">{match.field}</span>
                            <span className="text-ink-muted">:</span>
                            {highlightWord(snippet, query)}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <StatusBadge status={item.status} />
              </Link>
            </li>
          ))}

        {!loading && isQueryValid && results.length === 0 && (
          <li className="rounded-xl bg-tint-soft p-8 text-center">
            <p className="text-sm font-medium text-ink">
              No matches for “{query.trim()}”
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Try a different keyword or check spelling
            </p>
          </li>
        )}
      </ul>
    </div>
  );
}