import type { ReactNode } from "react";
import Link from "next/link";

type AuthPanelProps = {
  mode: "login" | "signup";
  children: ReactNode;
};

export function AuthPanel({ mode, children }: AuthPanelProps) {
  return (
    <section className="w-full max-w-md rounded-[2.2rem] border border-white/18 bg-white/10 p-4 text-white shadow-[0_30px_80px_-36px_var(--shadow-color)] backdrop-blur-xl md:p-5">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-2 rounded-[1.4rem] border border-white/16 bg-white/8 p-1.5">
          <Link
            className={`rounded-[1rem] px-4 py-2.5 text-center text-sm font-medium transition ${
              mode === "login"
                ? "bg-[#c2caec] text-[#0e1630]"
                : "text-white/74 hover:bg-white/10 hover:text-white"
            }`}
            href="/login"
          >
            Login
          </Link>
          <Link
            className={`rounded-[1rem] px-4 py-2.5 text-center text-sm font-medium transition ${
              mode === "signup"
                ? "bg-[#c2caec] text-[#0e1630]"
                : "text-white/74 hover:bg-white/10 hover:text-white"
            }`}
            href="/signup"
          >
            Create
          </Link>
        </div>

        <div className="rounded-[1.6rem] border border-white/18 bg-white/12 p-4 sm:p-5">
          {children}
        </div>
      </div>
    </section>
  );
}
