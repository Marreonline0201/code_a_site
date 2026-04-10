import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-600">
          Authentication failed
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
          Supabase could not complete the Google sign-in callback.
        </h1>
        <p className="text-base leading-7 text-zinc-600">
          Check your Supabase redirect allow list, your Google OAuth redirect
          URI, and the environment variables in this app, then try again.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white"
          href="/login"
        >
          Back to login
        </Link>
        <Link
          className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900"
          href="/"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
