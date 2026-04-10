import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const getSessionClaims = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error) {
    return null;
  }

  return data?.claims ?? null;
});

export async function requireUser() {
  const claims = await getSessionClaims();

  if (!claims?.sub) {
    redirect("/login");
  }

  return claims;
}
