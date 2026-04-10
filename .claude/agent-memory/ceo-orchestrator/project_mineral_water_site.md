---
name: Mineral Water Site Project Context
description: Project building a mineral water review website with hydration tracker — Supabase backend, ocean-themed UI, 50-task implementation plan
type: project
---

Building a content-driven mineral water review site with hydration tracker at code_a_site.

**Why:** User wants to become the authoritative resource for mineral water information with affiliate monetization (Amazon Associates) and daily user engagement via tracker.

**How to apply:** 
- Tech stack is Next.js 16 (App Router) + Tailwind v4 (CSS-native config, not tailwind.config.ts) + shadcn/ui v4 (base-nova style, oklch colors) + Supabase (PostgreSQL + Auth + RLS)
- Animation stack: Motion v11, GSAP + ScrollTrigger, Lenis, React Three Fiber
- The implementation plan has 50 tasks across 8 phases at docs/superpowers/plans/2026-04-10-mineral-water-site.md
- Plan was migrated from MongoDB to Supabase — all DB/auth uses Supabase client libraries
- Tailwind v4 required adapting plan's HSL-based tailwind.config.ts approach to CSS-native @theme inline with oklch colors
- shadcn/ui v4 uses @utility syntax instead of @layer utilities for custom classes
- Zod v4 uses `error.issues` not `error.errors` — different from v3 API
- Next.js 16.2.3 shows middleware.ts deprecation warning (recommends proxy.ts) but middleware.ts still works. proxy.ts file convention not yet fully supported in this version.
- All 50 tasks across 8 phases complete as of 2026-04-10
- shadcn/ui Button component uses @base-ui/react — no `asChild` prop. Wrap Link around Button instead of using asChild.
- Phase 8 (Tasks 43-50) completed: affiliate redirect /go/[brand], AffiliateButton component, dynamic sitemap, JSON-LD structured data + OG/Twitter meta, rate limiting on API routes, dark mode toggle, user data export + account deletion
