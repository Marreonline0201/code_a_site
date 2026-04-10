import type { ReactNode } from "react";

type FrontdoorShellProps = {
  actions?: ReactNode;
  children: ReactNode;
  pageLabel: string;
};

export function FrontdoorShell({
  actions,
  children,
  pageLabel,
}: FrontdoorShellProps) {
  return (
    <section className="relative isolate">
      <div
        className="absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_top,_rgba(194,202,236,0.5),_transparent_62%)]"
        aria-hidden="true"
      />

      <div className="mx-auto flex min-h-[calc(100svh-8rem)] w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-[2rem] bg-[#5a72a4] p-5 shadow-[0_30px_80px_-36px_rgba(20,35,76,0.65)] ring-1 ring-black/10 sm:p-6">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(194,202,236,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(24,169,255,0.12),_transparent_28%)]"
            aria-hidden="true"
          />
          <div className="relative rounded-[1.7rem] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5 backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.36em] text-white/72">
                  MineralWater
                </p>
                <p className="text-sm text-white/70">{pageLabel}</p>
              </div>
              {actions ? (
                <div className="flex flex-wrap items-center gap-3">{actions}</div>
              ) : null}
            </div>

            <div className="pt-6 sm:pt-8">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
