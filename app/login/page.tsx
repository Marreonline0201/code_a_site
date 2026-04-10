import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Supabase Auth
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
          Sign in with Google through the backend OAuth flow.
        </h1>
        <p className="max-w-xl text-base leading-7 text-zinc-600">
          The sign-in starts in a Route Handler, Supabase exchanges the OAuth
          code in a server callback, and the session is kept in cookies for
          server-side rendering and protected backend routes.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Link
          className="inline-flex w-fit items-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          href="/auth/sign-in/google?next=/dashboard"
        >
          Continue with Google
        </Link>
        <p className="text-sm text-zinc-500">
          After sign-in, the app redirects to <code>/dashboard</code>.
        </p>
      </div>
    </main>
  );
}
