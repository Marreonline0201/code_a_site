import type { ReactNode } from "react";

type HomeHeroProps = {
  actions: ReactNode;
};

const steps = [
  "Check your local water report",
  "Save your account with Google",
  "Return to your dashboard anytime",
];

export function HomeHero({ actions }: HomeHeroProps) {
  return (
    <section className="w-full rounded-[2.8rem] border border-white/14 bg-white/10 p-6 shadow-[0_30px_80px_-36px_var(--shadow-color)] backdrop-blur-xl md:p-8 lg:p-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-end">
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
              A quiet front door for local water clarity.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/74 sm:text-lg">
              TapSafe keeps the entry simple: learn what your local report says,
              sign in when you want to save progress, and return to the same
              calm dashboard later.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {actions}
          </div>
        </div>

        <div className="rounded-[2.1rem] border border-white/14 bg-white/10 p-5 backdrop-blur">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-white/64"></p>
          <div className="mt-5 space-y-4">
            {steps.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-[1.4rem] border border-white/10 bg-white/8 px-4 py-4 text-sm text-white/78"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c2caec] text-sm font-semibold text-[#0e1630]">
                  {index + 1}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
