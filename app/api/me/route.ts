import { getSessionClaims } from "@/lib/supabase/auth";

export async function GET() {
  const claims = await getSessionClaims();

  if (!claims?.sub) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({
    user: {
      id: claims.sub,
      email: typeof claims.email === "string" ? claims.email : null,
      appMetadata:
        typeof claims.app_metadata === "object" ? claims.app_metadata : null,
    },
  });
}
