"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (authError) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/tracker");
    router.refresh();
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <Button
        variant="outline"
        className="h-11 w-full rounded-full border-[#0e1630]/12 bg-white/72 text-[#0e1630] hover:bg-white"
        onClick={handleGoogleLogin}
        type="button"
      >
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-transparent px-2 text-[#0e1630]/46">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-[#0e1630]/70">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-2 h-11 rounded-2xl border-[#0e1630]/12 bg-white/80 px-4 text-[#0e1630] placeholder:text-[#0e1630]/38 focus-visible:border-[#18a9ff] focus-visible:ring-[#18a9ff]/25"
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-[#0e1630]/70">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-2 h-11 rounded-2xl border-[#0e1630]/12 bg-white/80 px-4 text-[#0e1630] placeholder:text-[#0e1630]/38 focus-visible:border-[#18a9ff] focus-visible:ring-[#18a9ff]/25"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          className="h-11 w-full rounded-full bg-[#0e1630] text-[#f4f7ff] hover:bg-[#1b2a52]"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-[#0e1630]/58">
        <a href="/forgot-password" className="underline hover:text-[#0e1630]">
          Forgot your password?
        </a>
      </p>
    </div>
  );
}
