import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const claims = await requireUser();
  const provider =
    typeof claims.app_metadata === "object" &&
    claims.app_metadata !== null &&
    "provider" in claims.app_metadata
      ? String(claims.app_metadata.provider)
      : "unknown";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
          Protected page
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
          Authenticated Supabase session on the server.
        </h1>
        <p className="text-base leading-7 text-zinc-600">
          This page uses server-side claims validation before rendering.
        </p>
      </div>

      <dl className="grid gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div>
          <dt className="text-sm font-medium text-zinc-500">User ID</dt>
          <dd className="mt-1 break-all text-sm text-zinc-950">{claims.sub}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-zinc-500">Email</dt>
          <dd className="mt-1 text-sm text-zinc-950">
            {typeof claims.email === "string" ? claims.email : "Unavailable"}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-zinc-500">Provider</dt>
          <dd className="mt-1 text-sm text-zinc-950">{provider}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        <Link
          className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900"
          href="/api/me"
        >
          Test protected API
        </Link>
        <Link
          className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900"
          href="/"
        >
          Home
        </Link>
        <form action={signOut}>
          <button
            className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
