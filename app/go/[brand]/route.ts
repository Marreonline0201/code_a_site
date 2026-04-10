import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

// GET /go/[brand] — affiliate redirect to Amazon
// Looks up brand by slug, builds Amazon URL with ASIN + affiliate tag, returns 302 redirect
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand: string }> }
) {
  const { brand: slug } = await params;

  // Rate limit: 30 requests per minute per IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const { allowed, retryAfterMs } = rateLimit(`affiliate:${ip}`, {
    limit: 30,
    windowMs: 60 * 1000,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
        },
      }
    );
  }

  // Validate slug format (alphanumeric + hyphens only)
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Invalid brand slug" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: brand, error } = await supabase
    .from("brands")
    .select("amazon_asin, name")
    .eq("slug", slug)
    .single();

  if (error || !brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  if (!brand.amazon_asin) {
    return NextResponse.json(
      { error: "No Amazon listing available for this brand" },
      { status: 404 }
    );
  }

  const tag = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "mineralwater-20";
  const amazonUrl = `https://www.amazon.com/dp/${brand.amazon_asin}?tag=${encodeURIComponent(tag)}`;

  return NextResponse.redirect(amazonUrl, 302);
}
