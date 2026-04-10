import type { ReactNode } from "react";

type AuthCardProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  footer: ReactNode;
  title: string;
};

export function AuthCard({
  children,
  description,
  eyebrow,
  footer,
  title,
}: AuthCardProps) {
  return (
    <div className="mx-auto w-full max-w-4xl rounded-[1.8rem] bg-[#c2caec] p-2 shadow-[0_24px_60px_-34px_rgba(14,22,48,0.6)] ring-1 ring-black/8">
      <div className="grid gap-6 rounded-[1.5rem] border border-[#0e1630]/10 bg-[linear-gradient(180deg,rgba(244,247,255,0.82),rgba(217,224,245,0.72))] p-6 text-[#0e1630] sm:p-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(18rem,1.1fr)] lg:items-start">
        <div className="space-y-4">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-[#0e1630]/52">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-md text-sm leading-7 text-[#0e1630]/68 sm:text-base">
            {description}
          </p>
          <div className="rounded-[1.25rem] border border-[#0e1630]/10 bg-white/36 px-4 py-4 text-sm leading-6 text-[#0e1630]/62">
            {footer}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#0e1630]/10 bg-white/56 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
          {children}
        </div>
      </div>
    </div>
  );
}
