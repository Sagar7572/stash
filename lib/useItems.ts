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
  patch: Partial<Pick<Item, "status" | "notes">>
): Promise<void> {
  const supabase = createClient();
  await supabase.from("items").update(patch).eq("id", id);
}
