import type { ReactNode } from "react";

type FrontdoorHomeProps = {
  actions: ReactNode;
};

const points = [
  "Compare mineral profiles without scanning a crowded landing page.",
  "Create an account only when you want to save progress or tracker history.",
  "Return to your tracker with the same calm entry flow every time.",
];

export function FrontdoorHome({ actions }: FrontdoorHomeProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end">
      <div className="rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(174,183,223,0.28),rgba(174,183,223,0.14))] p-6 ring-1 ring-white/10 sm:p-8">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-white/72">
          Home
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
          A minimal front door for your water routine.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/74 sm:text-lg">
          MineralWater now starts with one clear decision: browse quietly, sign
          in, or create an account. The rest of the site stays available after
          you pass through the same calm entry point.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {actions}
        </div>
      </div>

      <div className="rounded-[1.7rem] bg-[#c2caec] p-5 text-[#0e1630] ring-1 ring-black/8 sm:p-6">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-[#0e1630]/56">
          Flow
        </p>
        <div className="mt-5 space-y-3">
          {points.map((point, index) => (
            <div
              key={point}
              className="flex gap-4 rounded-[1.3rem] border border-[#0e1630]/10 bg-white/28 px-4 py-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#18a9ff] text-sm font-semibold text-white">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-[#0e1630]/72">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
