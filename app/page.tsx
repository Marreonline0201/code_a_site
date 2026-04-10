import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { getSessionClaims } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const claims = await getSessionClaims();
  const isAuthenticated = Boolean(claims?.sub);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-10 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Next.js 16 + Supabase SSR
        </p>
        <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-zinc-950">
          Google OAuth now runs through Supabase-backed server auth.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-600">
          The backend flow starts in a Route Handler, exchanges the OAuth code
          on the server, refreshes cookies in <code>proxy.ts</code>, and
          protects both pages and API routes with server-side claims checks.
        </p>
      </div>

      <div className="grid gap-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-950">Session state</h2>
          <p className="text-sm leading-6 text-zinc-600">
            {isAuthenticated
              ? `Signed in as ${typeof claims?.email === "string" ? claims.email : claims?.sub}.`
              : "No authenticated Supabase session was found on the server."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {isAuthenticated ? (
            <>
              <Link
                className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white"
                href="/dashboard"
              >
                Open dashboard
              </Link>
              <Link
                className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900"
                href="/api/me"
              >
                Open protected API
              </Link>
              <form action={signOut}>
                <button
                  className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900"
                  type="submit"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white"
                href="/login"
              >
                Sign in
              </Link>
              <Link
                className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900"
                href="/auth/sign-in/google?next=/dashboard"
              >
                Start Google OAuth directly
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
