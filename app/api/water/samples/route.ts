import { NextRequest } from "next/server";
import { parseSampleFilters } from "@/lib/water-quality/http";
import { querySamples, serializeSample } from "@/lib/water-quality/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const filters = parseSampleFilters(request.nextUrl.searchParams);
    const result = await querySamples(filters);

    return Response.json({
      data: result.data.map(serializeSample),
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        sortBy: result.sortBy,
        sortDir: result.sortDir,
        nearestMatches: result.nearestMatches,
      },
      filters,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to query water samples.";

    return Response.json({ error: message }, { status: 500 });
  }
}
