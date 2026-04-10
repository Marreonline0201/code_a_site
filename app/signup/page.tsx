import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/app/_components/auth-card";
import { FrontdoorShell } from "@/app/_components/frontdoor-shell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Sign Up - MineralWater",
};

export default function SignupPage() {
  return (
    <FrontdoorShell
      pageLabel="Signup"
      actions={
        <Link
          href="/login"
          className="rounded-full border border-white/16 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Already have an account?
        </Link>
      }
    >
      <AuthCard
        eyebrow="Sign Up"
        title="Create an account with one clear step."
        description="Set up your MineralWater account to save hydration history and keep your comparisons in one place."
        footer={
          <p>
            Sign-up uses the existing register flow. No backend auth behavior,
            callback handling, or validation rules were changed.
          </p>
        }
      >
        <RegisterForm />
      </AuthCard>
    </FrontdoorShell>
  );
}
