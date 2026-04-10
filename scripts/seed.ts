import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables"
  );
  process.exit(1);
}

// Service role client — bypasses RLS so we can write to public-read tables
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  const brands = JSON.parse(
    readFileSync(join(__dirname, "../data/seed/brands.json"), "utf-8")
  );
  const minerals = JSON.parse(
    readFileSync(join(__dirname, "../data/seed/minerals.json"), "utf-8")
  );

  // Clear existing data
  const { error: brandDeleteError } = await supabase
    .from("brands")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all rows
  if (brandDeleteError) throw brandDeleteError;

  const { error: mineralDeleteError } = await supabase
    .from("minerals")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (mineralDeleteError) throw mineralDeleteError;

  // Insert brands
  const { error: brandError } = await supabase
    .from("brands")
    .insert(brands);
  if (brandError) throw brandError;
  console.log(`Seeded ${brands.length} brands`);

  // Insert minerals
  const { error: mineralError } = await supabase
    .from("minerals")
    .insert(minerals);
  if (mineralError) throw mineralError;
  console.log(`Seeded ${minerals.length} minerals`);

  console.log("Done!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
