import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("app_stats")
      .select("visitors")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("[visitors] read error:", error);
      return NextResponse.json({ error: "Failed to read" }, { status: 500 });
    }

    return NextResponse.json({ count: data?.visitors ?? 0 });
  } catch (e) {
    console.error("[visitors] read exception:", e);
    return NextResponse.json({ error: "Failed to read" }, { status: 500 });
  }
}