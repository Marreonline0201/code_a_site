import { NextRequest } from "next/server";
import { getRecentSamples, serializeSample } from "@/lib/water-quality/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "10");
    const samples = await getRecentSamples(Number.isFinite(limit) ? limit : 10);

    return Response.json({
      data: samples.map(serializeSample),
      meta: {
        count: samples.length,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load recent samples.";

    return Response.json({ error: message }, { status: 500 });
  }
}
