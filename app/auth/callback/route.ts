import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  let next = request.nextUrl.searchParams.get("next") ?? "/dashboard";

  if (!next.startsWith("/")) {
    next = "/dashboard";
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(new URL(next, request.nextUrl.origin));
      }

      if (forwardedHost) {
        const forwardedProto =
          request.headers.get("x-forwarded-proto") ?? "https";

        return NextResponse.redirect(
          `${forwardedProto}://${forwardedHost}${next}`,
        );
      }

      return NextResponse.redirect(new URL(next, request.nextUrl.origin));
    }
  }

  return NextResponse.redirect(
    new URL("/auth/auth-code-error", request.nextUrl.origin),
  );
}
