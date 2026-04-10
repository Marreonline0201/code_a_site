import { NextRequest } from "next/server";
import { parseSampleFilters } from "@/lib/water-quality/http";
import { getSummary } from "@/lib/water-quality/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const filters = parseSampleFilters(request.nextUrl.searchParams);
    const summary = await getSummary(filters);

    return Response.json({
      data: summary,
      filters,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to summarize water samples.";

    return Response.json({ error: message }, { status: 500 });
  }
}
