"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const parsed = registerSchema.safeParse({ email, password, name });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      setError(firstError);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { name: parsed.data.name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError("Unable to create account. Please try again.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <h3 className="text-lg font-semibold text-[#0e1630]">Check your email</h3>
        <p className="text-[#0e1630]/64">
          If this email is available, we&apos;ve sent a verification link.
          Click it to activate your account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-[#0e1630]/70">
          Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          className="mt-2 h-11 rounded-2xl border-[#0e1630]/12 bg-white/80 px-4 text-[#0e1630] placeholder:text-[#0e1630]/38 focus-visible:border-[#18a9ff] focus-visible:ring-[#18a9ff]/25"
        />
      </div>
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
          autoComplete="new-password"
          className="mt-2 h-11 rounded-2xl border-[#0e1630]/12 bg-white/80 px-4 text-[#0e1630] placeholder:text-[#0e1630]/38 focus-visible:border-[#18a9ff] focus-visible:ring-[#18a9ff]/25"
        />
        <p className="mt-2 text-xs text-[#0e1630]/52">
          At least 8 characters with uppercase, lowercase, and a number.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        className="h-11 w-full rounded-full bg-[#0e1630] text-[#f4f7ff] hover:bg-[#1b2a52]"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
