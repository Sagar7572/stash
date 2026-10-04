import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface SearchItem {
  id: string;
  title: string;
  summary: string | null;
  keywords: string[];
  url: string;
  type: string;
  subject: string;
  status: string;
  created_at: string;
}

function extractMatchSnippet(text: string, query: string): { snippet: string; field: string } | null {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const words = lowerQuery.split(/\s+/).filter(Boolean);

  for (const word of words) {
    const idx = lowerText.indexOf(word);
    if (idx !== -1) {
      const start = Math.max(0, idx - 50);
      const end = Math.min(text.length, idx + word.length + 110);
      let snippet = text.slice(start, end);
      if (start > 0) snippet = "…" + snippet;
      if (end < text.length) snippet = snippet + "…";
      return { snippet, field: "content" };
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ results: [] });
    }

    // Build to_tsquery for full-text search (prefix matching with :*)
    const tsQuery = query
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => `${w}:*`)
      .join(" & ");

    // Try full-text search first
    let items: SearchItem[] = [];
    let searchError: Error | null = null;
    const { data, error } = await supabase
      .from("items")
      .select("id, title, summary, keywords, url, type, subject, status, created_at")
      .filter("search_vector", "textSearch", tsQuery)
      .order("created_at", { ascending: false })
      .limit(20);
    items = data ?? [];
    searchError = error;

    // Fallback: if full-text search fails or returns no results, try ILIKE
    if (searchError || !items?.length) {
      if (searchError) console.error("[search] Full-text search error:", searchError);
      
      const likeQuery = `%${query}%`;
      const { data: fallbackItems, error: fallbackError } = await supabase
        .from("items")
        .select("id, title, summary, keywords, url, type, subject, status, created_at")
        .or(`title.ilike.${likeQuery},summary.ilike.${likeQuery},keywords.cs.{${query}}`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (fallbackError) {
        console.error("[search] Fallback search error:", fallbackError);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
      }
      items = fallbackItems;
    }

    const results = (items ?? []).map((item) => {
      const matches: Array<{ field: string; snippet: string }> = [];

      // Check title
      if (item.title.toLowerCase().includes(query.toLowerCase())) {
        matches.push({ field: "title", snippet: item.title });
      }

      // Check summary
      if (item.summary?.toLowerCase().includes(query.toLowerCase())) {
        const match = extractMatchSnippet(item.summary, query);
        if (match) matches.push({ field: "summary", snippet: match.snippet });
      }

      // Check keywords
      if (item.keywords?.some((k: string) => k.toLowerCase().includes(query.toLowerCase()))) {
        const matchedKeywords = item.keywords
          .filter((k: string) => k.toLowerCase().includes(query.toLowerCase()))
          .join(", ");
        matches.push({ field: "keywords", snippet: matchedKeywords });
      }

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
      };
    });

    return NextResponse.json({ results });
  } catch (e) {
    console.error("[search] error:", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}