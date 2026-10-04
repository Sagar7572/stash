"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/lib/data";

type NewItem = Omit<Item, "id">;

async function fetchItems(): Promise<Item[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Item[];
}

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchItems().then((result) => {
      if (cancelled) return;
      setItems(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setItems(await fetchItems());
  }, []);

  return { items, loading, refresh };
}

export async function fetchSubjects(): Promise<string[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("items").select("subject");
  const subjects = new Set(
    (data ?? [])
      .map((row) => (row as { subject: string }).subject)
      .filter(Boolean)
  );
  return [...subjects].sort((a, b) => a.localeCompare(b));
}

export async function addItem(item: NewItem): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "You must be signed in.";

  const row = {
    title: item.title,
    url: item.url,
    type: item.type,
    subject: item.subject,
    tags: item.tags,
    status: item.status,
    summary: item.summary,
    notes: item.notes,
    keywords: item.keywords,
    user_id: user.id,
  };

  const { error } = await supabase.from("items").insert(row);
  return error ? error.message : null;
}

export async function deleteItem(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("items").delete().eq("id", id);
}

export async function updateItem(
  id: string,
  patch: Partial<Pick<Item, "status" | "notes" | "summary" | "keywords">>
): Promise<void> {
  const supabase = createClient();
  await supabase.from("items").update(patch).eq("id", id);
}

export async function updateSummary(
  id: string,
  summary: string
): Promise<void> {
  const supabase = createClient();
  await supabase.from("items").update({ summary }).eq("id", id);
}

export async function updateKeywords(
  id: string,
  keywords: string[]
): Promise<void> {
  const supabase = createClient();
  await supabase.from("items").update({ keywords }).eq("id", id);
}