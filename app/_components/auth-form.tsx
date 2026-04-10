"use client";

import { useActionState } from "react";
import type { AuthFormState } from "@/app/actions/auth";
import {
  signInWithPassword,
  signUpWithPassword,
} from "@/app/actions/auth";

type AuthFormProps = {
  mode: "login" | "signup";
};

const INITIAL_STATE: AuthFormState = {};

export function AuthForm({ mode }: AuthFormProps) {
  const action = mode === "login" ? signInWithPassword : signUpWithPassword;
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-3">
        <label className="flex flex-col gap-2">
          <span className="sr-only">Email</span>
          <input
            autoComplete="email"
            className="rounded-[1.2rem] border border-white/14 bg-[#f3f8ff] px-4 py-3 text-sm text-[#062247] outline-none transition placeholder:text-[#4d6687] focus:border-[#8ccfff] focus:ring-2 focus:ring-[#8ccfff]/35"
            name="email"
            placeholder="Email"
            required
            type="email"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="sr-only">Password</span>
          <input
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            className="rounded-[1.2rem] border border-white/14 bg-[#f3f8ff] px-4 py-3 text-sm text-[#062247] outline-none transition placeholder:text-[#4d6687] focus:border-[#8ccfff] focus:ring-2 focus:ring-[#8ccfff]/35"
            minLength={8}
            name="password"
            placeholder="Password"
            required
            type="password"
          />
        </label>

        {mode === "signup" ? (
          <label className="flex flex-col gap-2">
            <span className="sr-only">Confirm password</span>
            <input
              autoComplete="new-password"
              className="rounded-[1.2rem] border border-white/14 bg-[#f3f8ff] px-4 py-3 text-sm text-[#062247] outline-none transition placeholder:text-[#4d6687] focus:border-[#8ccfff] focus:ring-2 focus:ring-[#8ccfff]/35"
              minLength={8}
              name="confirmPassword"
              placeholder="Confirm password"
              required
              type="password"
            />
          </label>
        ) : null}
      </div>

      {state.error ? (
        <p className="rounded-[1.1rem] border border-rose-400/28 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-[1.1rem] border border-emerald-300/28 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
          {state.success}
        </p>
      ) : null}

      <button
        className="rounded-full bg-[#8ccfff] px-5 py-3 text-sm font-semibold text-[#062247] transition hover:bg-[#a8dcff] disabled:cursor-not-allowed disabled:bg-[#5f8fb6] disabled:text-[#dcecff]"
        disabled={pending}
        type="submit"
      >
        {pending
          ? mode === "login"
            ? "Signing in..."
            : "Creating account..."
          : mode === "login"
            ? "Sign in with email"
            : "Create account"}
      </button>
    </form>
  );
}
