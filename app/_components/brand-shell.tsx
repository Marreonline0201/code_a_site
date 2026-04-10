import type { ReactNode } from "react";
import Link from "next/link";

type BrandShellProps = {
  actions?: ReactNode;
  children: ReactNode;
};

export function BrandShell({ actions, children }: BrandShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div
        className="ambient-glow absolute inset-x-0 top-0 h-80"
        aria-hidden="true"
      />
      <div className="ambient-orb absolute left-[-8rem] top-20" aria-hidden="true" />
      <div className="ambient-orb ambient-orb--small absolute bottom-16 right-[-4rem]" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col gap-8">
        <header className="flex items-center justify-between rounded-[1.8rem] border border-white/16 bg-white/8 px-5 py-4 backdrop-blur-xl">
          <Link href="/" className="space-y-1">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.38em] text-white/76">
              TapSafe
            </p>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            {actions ?? (
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
            )}
          </nav>
        </header>

        <div className="flex flex-1 items-center justify-center">{children}</div>
      </div>
    </main>
  );
}
