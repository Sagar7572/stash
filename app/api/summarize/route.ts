import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const API_KEY = process.env.GROQ_API_KEY;
const BASE_URL = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1";
const MODEL = process.env.LLM_MODEL || "llama-3.1-8b-instant";

const JINA_READER_BASE = "https://r.jina.ai/http";
const FETCH_TIMEOUT = 10000;
const MAX_TEXT_LENGTH = 6000;
const MIN_TEXT_LENGTH = 200;

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

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

  return { title, text: text.slice(0, MAX_TEXT_LENGTH) };
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

async function fetchWithJina(url: string): Promise<{ title: string; text: string } | null> {
  const jinaUrl = `${JINA_READER_BASE}://${url.replace(/^https?:\/\//, "")}`;
  console.log("[summarize] Trying Jina AI reader:", jinaUrl);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(jinaUrl, {
      signal: controller.signal,
      headers: { "User-Agent": BROWSER_HEADERS["User-Agent"] },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.log(`[summarize] Jina AI returned ${res.status}`);
      return null;
    }

    const text = await res.text();
    if (!text || text.length < MIN_TEXT_LENGTH) {
      console.log("[summarize] Jina AI returned insufficient text");
      return null;
    }

    const lines = text.trim().split("\n");
    const title = lines[0] || "Untitled";
    const body = lines.slice(1).join("\n");

    return { title, text: body.slice(0, MAX_TEXT_LENGTH) };
  } catch (e) {
    clearTimeout(timeout);
    console.error("[summarize] Jina AI fetch failed:", e);
    return null;
  }
}

async function fetchPageContent(url: string): Promise<{ title: string; text: string } | null> {
  console.log("[summarize] Attempting direct fetch:", url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: BROWSER_HEADERS,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.log(`[summarize] Direct fetch returned ${res.status}`);
    } else {
      const html = await res.text();
      const { title, text } = extractReadableText(html);
      if (text.length >= MIN_TEXT_LENGTH) {
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
  if (!API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to .env.local");
  }

  const systemPrompt =
    "You are a concise summarizer. Respond with ONLY a valid JSON object: {\"summary\": string, \"keywords\": string[]}. No markdown, no code fences, no extra text.";

  const baseBody = {
    model: MODEL,
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
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error(`[summarize] LLM error ${response.status} (attempt ${attempt}):`, errBody);

        if (attempt === maxAttempts) {
          let msg = "Summarization service error";
          if (response.status === 401) msg = "Invalid Groq API key";
          else if (response.status === 404) msg = `Model "${MODEL}" not found on Groq`;
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
        console.error("[summarize] Empty content in response:", JSON.stringify(data));
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

export async function POST(req: NextRequest) {
  let stage = "init";
  try {
    const { url } = await req.json();

    if (!url || !/^https?:\/\//.test(url)) {
      return NextResponse.json({ error: "Valid URL required" }, { status: 400 });
    }

    // Stage 1: Fetch page content
    stage = "fetch-direct";
    console.log("[summarize] Stage: fetch-direct for URL:", url);
    let content = await fetchPageContent(url);

    if (!content || content.text.length < MIN_TEXT_LENGTH) {
      stage = "fetch-jina";
      console.log("[summarize] Stage: fetch-jina (fallback)");
      const jinaContent = await fetchWithJina(url);
      if (!jinaContent || jinaContent.text.length < MIN_TEXT_LENGTH) {
        stage = "fetch-jina-failed";
        return NextResponse.json(
          { error: "Could not extract enough content from page", detail: "Both direct fetch and Jina AI fallback failed", stage: "fetch-jina-failed" },
          { status: 422 }
        );
      }
      content = jinaContent;
    }

    // Stage 2: LLM call
    stage = "llm-call";
    console.log("[summarize] Stage: llm-call for URL:", url);
    const prompt = `Summarize this article and extract keywords.

Title: ${content.title}
Content: ${content.text}

Return JSON: { "summary": "~80 words", "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"] }`;

    let result;
    try {
      result = await callLLMWithRetry(prompt, 2);
    } catch (e) {
      stage = "llm-call-failed";
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("[summarize] LLM call failed:", err);
      if (err.stack) console.error(err.stack);
      return NextResponse.json(
        { error: "Summarization failed", detail: err.message, stage },
        { status: 500 }
      );
    }

    if (!result) {
      stage = "parse-failed";
      return NextResponse.json(
        { error: "Could not summarize after retries", detail: "LLM returned no valid result", stage },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[summarize] error:", err);
    if (err.stack) console.error(err.stack);
    const detail = err.message;
    return NextResponse.json(
      { error: "Summarization failed", detail, stage },
      { status: 500 }
    );
  }
}