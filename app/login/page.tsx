import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/app/_components/auth-card";
import { FrontdoorShell } from "@/app/_components/frontdoor-shell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log In - MineralWater",
};

export default function LoginPage() {
  return (
    <FrontdoorShell
      pageLabel="Login"
      actions={
        <Link
          href="/signup"
          className="rounded-full border border-white/16 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Need an account?
        </Link>
      }
    >
      <AuthCard
        eyebrow="Login"
        title="Sign in without the extra noise."
        description="Use your existing account to return to saved hydration tracking and brand comparisons."
        footer={
          <p>
            The underlying Supabase auth flow stays unchanged. This page only
            narrows the layout and language around it.
          </p>
        }
      >
        <LoginForm />
      </AuthCard>
    </FrontdoorShell>
  );
}
