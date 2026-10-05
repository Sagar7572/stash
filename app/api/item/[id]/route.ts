import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLocalItems } from "@/lib/storage";

interface Item {
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
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({
        id: data.id,
        title: data.title,
        url: data.url,
        type: data.type,
        subject: data.subject,
        tags: data.tags ?? [],
        status: data.status,
        summary: data.summary,
        notes: data.notes,
        keywords: data.keywords ?? [],
        created_at: data.created_at,
      });
    }

    const localItems = getLocalItems();
    const item = localItems.find((it) => it.id === id);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (e) {
    console.error("[api/item/[id]] error:", e);
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}