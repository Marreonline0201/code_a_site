import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/tracker/stats — fetch aggregated hydration stats
// Query params: days (default 7, max 90)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(
    Math.max(parseInt(searchParams.get("days") ?? "7", 10), 1),
    90
  );

  // Use the database function for aggregated stats
  const { data: stats, error } = await supabase.rpc("get_hydration_stats", {
    p_user_id: user.id,
    p_days: days,
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch hydration stats" },
      { status: 500 }
    );
  }

  // Also fetch today's entries for the dashboard
  const today = new Date().toISOString().split("T")[0];
  const { data: todayEntries, error: todayError } = await supabase
    .from("hydration_entries")
    .select("*")
    .eq("date", today)
    .order("logged_at", { ascending: false });

  if (todayError) {
    return NextResponse.json(
      { error: "Failed to fetch today's entries" },
      { status: 500 }
    );
  }

  const todayTotal = (todayEntries ?? []).reduce(
    (sum, entry) => sum + entry.amount,
    0
  );

  return NextResponse.json({
    stats,
    today: {
      entries: todayEntries ?? [],
      total: todayTotal,
    },
  });
}
