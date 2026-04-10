import Link from "next/link";
import { FrontdoorHome } from "@/app/_components/frontdoor-home";
import { FrontdoorShell } from "@/app/_components/frontdoor-shell";
import { signOut } from "@/app/actions/auth";
import { getSessionClaims } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const claims = await getSessionClaims();
  const isAuthenticated = Boolean(claims?.sub);

  const shellActions = isAuthenticated ? (
    <>
      <Link
        href="/tracker"
        className="rounded-full border border-white/16 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
      >
        Open tracker
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-full bg-[#c2caec] px-4 py-2 text-sm font-medium text-[#0e1630] transition hover:bg-[#d7def5]"
        >
          Sign out
        </button>
      </form>
    </>
  ) : (
    <>
      <Link
        href="/login"
        className="rounded-full border border-white/16 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-full bg-[#c2caec] px-4 py-2 text-sm font-medium text-[#0e1630] transition hover:bg-[#d7def5]"
      >
        Sign up
      </Link>
    </>
  );

  const heroActions = isAuthenticated ? (
    <>
      <Link
        href="/tracker"
        className="rounded-full bg-[#c2caec] px-5 py-3 text-sm font-medium text-[#0e1630] transition hover:bg-[#d7def5]"
      >
        Go to tracker
      </Link>
      <Link
        href="/brands"
        className="rounded-full border border-white/16 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
      >
        Browse brands
      </Link>
    </>
  ) : (
    <>
      <Link
        href="/signup"
        className="rounded-full bg-[#c2caec] px-5 py-3 text-sm font-medium text-[#0e1630] transition hover:bg-[#d7def5]"
      >
        Create account
      </Link>
      <Link
        href="/login"
        className="rounded-full border border-white/16 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
      >
        Log in
      </Link>
    </>
  );

  return (
    <FrontdoorShell actions={shellActions} pageLabel="Minimal entry flow">
      <FrontdoorHome actions={heroActions} />
    </FrontdoorShell>
  );
}
