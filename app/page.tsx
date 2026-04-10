import Link from "next/link";
import { BrandShell } from "@/app/_components/brand-shell";
import { HomeHero } from "@/app/_components/home-hero";
import { signOut } from "@/app/actions/auth";
import { getSessionClaims } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const claims = await getSessionClaims();
  const isAuthenticated = Boolean(claims?.sub);

  const headerActions = isAuthenticated ? (
    <>
      <Link
        className="rounded-full border border-white/18 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        href="/dashboard"
      >
        Dashboard
      </Link>
      <form action={signOut}>
        <button
          className="rounded-full bg-[#c2caec] px-4 py-2 text-sm font-medium text-[#0e1630] transition hover:bg-[#d8def6]"
          type="submit"
        >
          Sign out
        </button>
      </form>
    </>
  ) : (
    <>
      <Link
        className="rounded-full border border-white/18 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        href="/login"
      >
        Login
      </Link>
      <Link
        className="rounded-full bg-[#c2caec] px-4 py-2 text-sm font-medium text-[#0e1630] transition hover:bg-[#d8def6]"
        href="/signup"
      >
        Sign up
      </Link>
    </>
  );

  const heroActions = isAuthenticated ? (
    <>
      <Link
        className="rounded-full bg-[#c2caec] px-5 py-3 text-sm font-medium text-[#0e1630] transition hover:bg-[#d8def6]"
        href="/dashboard"
      >
        Open dashboard
      </Link>
      <form action={signOut}>
        <button
          className="rounded-full border border-white/18 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          type="submit"
        >
          Sign out
        </button>
      </form>
    </>
  ) : (
    <>
      <Link
        className="rounded-full bg-[#c2caec] px-5 py-3 text-sm font-medium text-[#0e1630] transition hover:bg-[#d8def6]"
        href="/signup"
      >
        Create account
      </Link>
      <Link
        className="rounded-full border border-white/18 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        href="/login"
      >
        Log in
      </Link>
    </>
  );

  return (
    <BrandShell actions={headerActions}>
      <HomeHero actions={heroActions} />
    </BrandShell>
  );
}
