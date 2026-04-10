import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugSchema } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: mineral, error } = await supabase
    .from("minerals")
    .select("*")
    .eq("slug", parsed.data)
    .single();

  if (error || !mineral) {
    return NextResponse.json(
      { error: "Mineral not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(mineral);
}
