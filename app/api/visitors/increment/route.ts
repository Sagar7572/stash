import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("increment_visitors");

    if (error) {
      console.error("[visitors] increment error:", error);
      return NextResponse.json({ error: "Failed to increment" }, { status: 500 });
    }

    return NextResponse.json({ count: data });
  } catch (e) {
    console.error("[visitors] increment exception:", e);
    return NextResponse.json({ error: "Failed to increment" }, { status: 500 });
  }
}