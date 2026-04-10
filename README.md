This is a Next.js 16 App Router project with Supabase SSR authentication and a backend Google OAuth flow.

## Environment

Copy either example file into `.env.local`:

```bash
cp .env.local.example .env.local
```

Required variables:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_project_key
```

## Supabase and Google setup

1. In Supabase, enable the Google provider under `Authentication -> Providers -> Google`.
2. In Google Cloud, create a Web OAuth client.
3. In Google Cloud, add your app origin under Authorized JavaScript origins.
4. In Google Cloud, add the Supabase callback URL shown in the Supabase Google provider screen under Authorized redirect URIs.
5. In Supabase `Authentication -> URL Configuration`, add your app callback URL to the redirect allow list:

```text
http://localhost:3000/auth/callback
```

For production, also add your deployed domain's callback URL:

```text
https://your-domain.com/auth/callback
```

## Getting started

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Auth flow

- `GET /auth/sign-in/google` starts Google OAuth on the backend with `supabase.auth.signInWithOAuth()`.
- `GET /auth/callback` exchanges the authorization code for a session with `supabase.auth.exchangeCodeForSession()`.
- `proxy.ts` refreshes auth cookies for SSR requests with `supabase.auth.getClaims()`.
- `lib/supabase/auth.ts` centralizes server-side session checks for protected pages and routes.
- `GET /api/me` is a protected backend endpoint that returns the authenticated user claims.

## Learn More

To learn more about the current framework and auth APIs used here:

- [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication)
- [Supabase SSR client guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase Google OAuth guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

## Pages and routes

- `/` shows whether the server sees an authenticated session.
- `/login` starts the Google sign-in flow.
- `/dashboard` is protected server-rendered content.
- `/api/me` is a protected backend route.
