"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Item, ItemType, Status } from "@/lib/data";

const STORAGE_KEY = "stash_local_items";

interface SupabaseItemRow {
  id: string;
  title: string;
  url: string;
  type: string;
  subject: string;
  tags: string[];
  status: string;
  summary: string | null;
  notes: string | null;
  keywords: string[];
  created_at: string;
  user_id: string;
}

function generateId(): string {
  return crypto.randomUUID();
}

export function getLocalItems(): Item[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setLocalItems(items: Item[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("[storage] Failed to save to localStorage:", e);
  }
}

interface SupabaseItemRow {
  id: string;
  title: string;
  url: string;
  type: string;
  subject: string;
  tags: string[];
  status: string;
  summary: string | null;
  notes: string | null;
  keywords: string[];
  created_at: string;
  user_id: string;
}

function mapSupabaseItem(row: SupabaseItemRow): Item {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    type: row.type as ItemType,
    subject: row.subject,
    tags: row.tags ?? [],
    status: row.status as Status,
    summary: row.summary ?? "",
    notes: row.notes ?? "",
    keywords: row.keywords ?? [],
    created_at: row.created_at,
  };
}

function mapToSupabaseRow(item: Omit<Item, "id" | "created_at">, userId: string) {
  return {
    title: item.title,
    url: item.url,
    type: item.type,
    subject: item.subject,
    tags: item.tags,
    status: item.status,
    summary: item.summary,
    notes: item.notes,
    keywords: item.keywords,
    user_id: userId,
  };
}

export async function fetchItems(): Promise<Item[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[storage] Supabase fetch error:", error);
      return [];
    }
    return (data ?? []).map(mapSupabaseItem);
  }

  return getLocalItems();
}

export async function fetchSubjects(): Promise<string[]> {
  const items = await fetchItems();
  const subjects = new Set(items.map((item) => item.subject).filter(Boolean));
  return [...subjects].sort((a, b) => a.localeCompare(b));
}

export async function addItem(item: Omit<Item, "id" | "created_at">): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const row = mapToSupabaseRow(item, user.id);
    const { data, error } = await supabase.from("items").insert(row).select("id").single();
    if (error) return error.message;
    return null;
  }

  const items = getLocalItems();
  const newItem: Item = {
    ...item,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  items.unshift(newItem);
  setLocalItems(items);
  return null;
}

export async function deleteItem(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("items").delete().eq("id", id);
    return;
  }

  const items = getLocalItems().filter((item) => item.id !== id);
  setLocalItems(items);
}

export async function mergeLocalToSupabase(): Promise<{ success: boolean; migratedCount: number; errors: string[] }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, migratedCount: 0, errors: ["No authenticated user"] };
  }

  const localItems = getLocalItems();
  if (localItems.length === 0) {
    return { success: true, migratedCount: 0, errors: [] };
  }

  const migratedIds: string[] = [];
  const errors: string[] = [];

  for (const item of getLocalItems()) {
    try {
      const row = mapToSupabaseRow(item, user.id);
      const { error } = await supabase.from("items").insert({
        ...row,
        id: item.id,
        created_at: item.created_at,
      });
      if (error) {
        errors.push(`Item "${item.title}": ${error.message}`);
      } else {
        migratedIds.push(item.id);
      }
    } catch (e) {
      errors.push(`Item "${item.title}": ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Only remove successfully migrated items from localStorage
  if (migratedIds.length > 0) {
    const remainingItems = getLocalItems().filter(item => !migratedIds.includes(item.id));
    setLocalItems(remainingItems);
  }

  return {
    success: migratedIds.length > 0,
    migratedCount: migratedIds.length,
    errors,
  };
}

export async function updateItem(
  id: string,
  patch: Partial<Pick<Item, "status" | "notes" | "summary" | "keywords">>
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("items").update(patch).eq("id", id);
    return;
  }

  const items = getLocalItems();
  const idx = items.findIndex((item) => item.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...patch };
    setLocalItems(items);
  }
}

export async function updateSummary(id: string, summary: string): Promise<void> {
  await updateItem(id, { summary });
}

export async function updateKeywords(id: string, keywords: string[]): Promise<void> {
  await updateItem(id, { keywords });
}

async function fetchWithJina(url: string): Promise<{ title: string; text: string } | null> {
  const JINA_READER_BASE = "https://r.jina.ai/http";
  const FETCH_TIMEOUT = 10000;
  const MIN_TEXT_LENGTH = 200;

  const BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  };

  const jinaUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`;
  console.log("[summarize] Trying Jina AI reader:", jinaUrl);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(jinaUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.log(`[summarize] Jina AI returned ${res.status}`);
      return null;
    }

    const text = await res.text();
    if (!text || text.length < 200) {
      console.log("[summarize] Jina AI returned insufficient text");
      return null;
    }

    const lines = text.trim().split("\n");
    const title = lines[0] || "Untitled";
    const body = lines.slice(1).join("\n");

    return { title, text: body.slice(0, 6000) };
  } catch (e) {
    clearTimeout(timeout);
    console.error("[summarize] Jina AI fetch failed:", e);
    return null;
  }
}

async function fetchPageContent(url: string): Promise<{ title: string; text: string } | null> {
  console.log("[summarize] Attempting direct fetch:", url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.log(`[summarize] Direct fetch returned ${res.status}`);
    } else {
      const html = await res.text();
      const { title, text } = extractReadableText(html);
      if (text.length >= 200) {
        console.log("[summarize] Direct fetch succeeded");
        return { title, text };
      }
      console.log(`[summarize] Direct fetch extracted insufficient text (${text.length} chars)`);
    }
  } catch (e) {
    clearTimeout(timeout);
    console.log("[summarize] Direct fetch failed:", e instanceof Error ? e.message : e);
  }

  console.log("[summarize] Falling back to Jina AI reader");
  return fetchWithJina(url);
}

async function callLLMWithRetry(
  prompt: string,
  maxAttempts = 2
): Promise<{ summary: string; keywords: string[] }> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to .env.local");
  }

  const BASE_URL = "https://api.groq.com/openai/v1";
  const MODEL = "openai/gpt-oss-20b";

  const systemPrompt =
    "You are a concise summarizer. Respond with ONLY a valid JSON object: {\"summary\": string, \"keywords\": string[]}. No markdown, no code fences, no extra text.";

  const baseBody = {
    model: "openai/gpt-oss-20b",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 1000,
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const useJsonObject = attempt === 1;
    const body = useJsonObject
      ? { ...baseBody, response_format: { type: "json_object" } }
      : baseBody;

    try {
      const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error(`[summarize] LLM error ${response.status} (attempt ${attempt}):`, errBody);

        if (attempt === maxAttempts) {
          let msg = "Summarization service error";
          if (response.status === 401) msg = "Invalid Groq API key";
          else if (response.status === 404) msg = "Model not found on Groq";
          else if (response.status === 429) msg = "Rate limited — please wait and try again";
          else if (response.status === 400 && useJsonObject) {
            console.log("[summarize] json_object mode failed, will retry without it");
            continue;
          }
          throw new Error(msg);
        }
        continue;
      }

      const data = await response.json();
      console.log("[summarize] Raw LLM response:", JSON.stringify(data, null, 2));
      const content = data.choices[0]?.message?.content?.trim();

      if (!content) {
        if (attempt === maxAttempts) throw new Error("Empty response from LLM");
        continue;
      }

      const parsed = extractJSON(content);
      if (parsed) {
        return parsed;
      }

      console.error(`[summarize] Failed to parse JSON (attempt ${attempt}):`, content);

      if (attempt === maxAttempts) {
        return {
          summary: content.slice(0, 500),
          keywords: [],
        };
      }
    } catch (e) {
      if (attempt === maxAttempts) throw e;
      console.error(`[summarize] Attempt ${attempt} failed:`, e);
    }
  }

  throw new Error("Summarization failed after retries");
}

function extractReadableText(html: string): { title: string; text: string } {
  let title = "";
  const titleStart = html.indexOf("<title");
  if (titleStart !== -1) {
    const titleEnd = html.indexOf("</title>", titleStart);
    if (titleEnd !== -1) {
      const titleContent = html.slice(titleStart, titleEnd);
      const gtIndex = titleContent.indexOf(">");
      if (gtIndex !== -1) {
        title = titleContent.slice(gtIndex + 1).trim();
      }
    }
  }

  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { title, text: text.slice(0, 6000) };
}

function extractJSON(text: string): { summary: string; keywords: string[] } | null {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  const jsonStr = cleaned.slice(start, end + 1);

  try {
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed.summary === "string" && Array.isArray(parsed.keywords)) {
      return { summary: parsed.summary, keywords: parsed.keywords };
    }
    if (typeof parsed.summary === "string" && typeof parsed.keywords === "string") {
      return {
        summary: parsed.summary,
        keywords: parsed.keywords.split(",").map((k: string) => k.trim()).filter(Boolean),
      };
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(req: Request) {
  const stage = "init";
  try {
    const { url } = await req.json();

    if (!url || !/^https?:\/\//.test(url)) {
      return Response.json({ error: "Valid URL required", userMessage: "That doesn't look like a valid link. Check the URL and try again." }, { status: 400 });
    }

    // Stage 1: Fetch page content
    let content = await fetchPageContent(url);

    if (!content || content.text.length < 200) {
      console.log("[summarize] Stage: fetch-jina (fallback)");
      const jinaContent = await fetchWithJina(url);
      if (!jinaContent || jinaContent.text.length < 200) {
        return Response.json(
          { error: "Could not extract enough content from page", userMessage: "This page doesn't have enough article text to summarise. Add a summary yourself below.", stage: "fetch-jina-failed" },
          { status: 422 }
        );
      }
      content = jinaContent;
    }

    // Stage 2: LLM call
    const prompt = `Summarize this article and extract keywords.

Title: ${content.title}
Content: ${content.text}

Return JSON: { "summary": "~80 words", "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"] }`;

    let result;
    try {
      result = await callLLMWithRetry(prompt, 2);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("[summarize] LLM call failed:", err);
      if (err.stack) console.error(err.stack);
      return Response.json(
        { error: "Summarization failed", userMessage: "The AI summariser isn't available right now. Try again in a moment, or add a summary yourself.", stage: "llm-call-failed" },
        { status: 500 }
      );
    }

    if (!result) {
      return Response.json(
        { error: "Could not summarize after retries", userMessage: "Couldn't summarise this page. You can add a summary manually and still save it." },
        { status: 500 }
      );
    }

    return Response.json(result);
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[summarize] error:", err);
    if (err.stack) console.error(err.stack);
    return Response.json(
      { error: "Summarization failed", userMessage: "Couldn't summarise this page. You can add a summary manually and still save it." },
      { status: 500 }
    );
  }
}

export function useLocalItems(): { items: Item[]; loading: boolean; refresh: () => Promise<void> } {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const data = await fetchItems();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const data = await fetchItems();
        if (!cancelled) {
          setItems(data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, refresh };
}