import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: minerals, error } = await supabase
    .from("minerals")
    .select("*")
    .order("name");

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch minerals" },
      { status: 500 }
    );
  }

  return NextResponse.json(minerals);
}
