import { createClient } from "@supabase/supabase-js";

// WARNING: This client bypasses ALL Row Level Security.
// Only use in server-side code for admin operations like:
// - Account deletion
// - Data export
// - Seeding
// NEVER import this file in client components.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
