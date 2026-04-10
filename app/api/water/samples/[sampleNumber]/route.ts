import { getSampleByNumber, serializeSample } from "@/lib/water-quality/service";

export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{
    sampleNumber: string;
  }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const { sampleNumber } = await context.params;
    const sample = await getSampleByNumber(sampleNumber);

    if (!sample) {
      return Response.json(
        { error: `Sample "${sampleNumber}" was not found.` },
        { status: 404 },
      );
    }

    return Response.json({
      data: serializeSample(sample),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load water sample.";

    return Response.json({ error: message }, { status: 500 });
  }
}
