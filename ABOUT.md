## Inspiration

We drink 2+ liters of water every day without ever questioning what's actually in it. One day we compared the labels on two bottles sitting on the same shelf — one had 108 mg/L of magnesium, the other had zero. Same price. Completely different health impact. That moment made us realize: nobody is making this information accessible. Meanwhile, 12,000+ U.S. water systems have had safety violations in the last three years, and most people have no idea if theirs is one of them. We built MineralWater to close that gap — to make the invisible visible and help people make smarter choices about something they consume every single day.

## What it does

MineralWater is a content-driven platform that lets users:

- **Compare 15 mineral water brands** side-by-side by calcium, magnesium, sodium, pH, TDS, and 11 mineral types — with real product images and Amazon affiliate links
- **Look up U.S. tap water quality** by state and county using live EPA ECHO enforcement data, with an interactive map, lead/copper test results (actual mg/L values), violation history, and compliance tracking
- **Track daily hydration** with a personal dashboard featuring a progress ring, quick-log buttons, history charts, and smart reminder settings
- **Learn what each mineral does** through problem-first framing ("Poor sleep? Low energy?" leads to Magnesium) so users understand health impacts at a glance
- **Read curated content** including best-for guides (best water for athletes, alkaline, budget), brand reviews, and educational blog posts about water quality

## How we built it

- **Frontend**: Next.js 16 App Router with TypeScript, Tailwind CSS v4, and shadcn/ui components
- **Database & Auth**: Supabase (PostgreSQL) with Row Level Security policies on every table, Supabase Auth for email/password + Google OAuth with built-in email verification
- **Animations**: Scroll-driven video hero with 120 pre-rendered canvas frames, Motion (Framer Motion) for scroll reveals, CSS keyframe animations for floating bottles and wave dividers
- **Water Quality Data**: EPA ECHO SDWA REST API integration for nationwide water system lookups, plus NYC lead-at-the-tap CSV data for local testing results
- **Map**: Leaflet with OpenStreetMap tiles (free, no API key) for visualizing water systems by compliance status
- **Deployment**: Vercel with automatic GitHub deployments, environment variable management, and serverless functions
- **Security**: Zod validation on all inputs, sanitize-html for XSS prevention, rate limiting on API routes, CSP headers, open redirect protection on OAuth callbacks
- **SEO**: Dynamic sitemap, JSON-LD structured data (Product, Article, Organization schemas), Open Graph + Twitter Card meta tags on every page

## Challenges we ran into

- **EPA API limitations**: The Envirofacts SDWIS API had poor ZIP code search support and returned XML instead of JSON. We pivoted to the ECHO API which had richer data but required a two-step query pattern (search returns a QueryID, then fetch results separately).
- **Scroll-driven video performance**: Setting `video.currentTime` on scroll was extremely laggy. We solved this by pre-extracting 120 frames into `ImageBitmap` objects and drawing them to a canvas — instant scrubbing with zero decode lag.
- **Tailwind v4 migration**: The implementation plan was written for Tailwind v3 (config-based with HSL colors). Tailwind v4 uses CSS-native `@theme inline` blocks with oklch colors — every theme token and utility class had to be adapted.
- **Supabase Auth on Vercel**: The `getUser()` call would throw for unauthenticated users, crashing the entire server component render. Video files were also being intercepted by the proxy middleware and redirected to the login page for logged-out users.
- **Amazon ASINs**: All 15 initial product ASINs were fake/outdated from the seed data generator. We had to manually search Amazon for each brand and verify every link points to a real product page.
- **Team coordination**: Multiple developers pushing to the same branch caused TypeScript errors from untyped dependencies (`jsdom`, `leadRisk` type mismatches) that broke Vercel deployments. Required constant pull-before-push discipline.

## Accomplishments that we're proud of

- **Scroll storytelling hero**: 15 water bottles reveal one-by-one as you scroll, with the ocean video scrubbing in sync — each bottle has glassmorphism "View Details" and "Buy on Amazon" action buttons
- **Real EPA data integration**: Users can look up any U.S. water system by state/county and see actual lead test results in mg/L compared against EPA action levels, with color-coded violation severity and enforcement history
- **Security-first architecture**: RLS on every database table, security audit with 12 findings (2 critical, 3 high) — all fixed before launch. Even if API code has a bug, the database blocks unauthorized access.
- **At-a-glance mineral education**: Problem-first framing with colored keywords ("Poor sleep?" in violet, "Dull skin?" in pink) makes health benefits scannable in seconds without reading paragraphs
- **Full product in one session**: 50 tasks across 8 phases — from scaffold to deployed site with auth, 15 brand pages, hydration tracker, blog, comparison tool, and EPA integration

## What we learned

- **Database choice matters early**: Migrating from MongoDB/Mongoose to Supabase mid-plan required rewriting the data model, auth system, all API routes, and the seed script. Making this decision before writing code would have saved significant rework.
- **Video on the web is harder than it looks**: Autoplay policies, codec support, file size budgets, and scroll-driven playback each have their own set of browser quirks. Pre-rendering frames to canvas was the only approach that worked smoothly across all browsers.
- **Security is a feature, not an afterthought**: Running the security auditor agent mid-development caught an open redirect in the OAuth callback and a service role key syncing to OneDrive — both would have been serious production vulnerabilities.
- **Users don't read — they scan**: Every description we wrote was too long on the first pass. Cutting to one-line explanations with colored problem keywords made the content 10x more effective.
- **Pull before push, every time**: With multiple contributors, forgetting to pull caused non-fast-forward rejections and merge conflicts. Making it a muscle memory habit (`commit && pull && push`) eliminated deployment failures.

## What's next for MineralWater

- **ZIP code water system lookup**: Use geocoding to map ZIP codes to the correct water system automatically, instead of requiring state + county selection
- **Personalized mineral recommendations**: Based on user health goals (better sleep, stronger bones, post-workout recovery), recommend specific brands with the highest relevant mineral content
- **Water filter recommendations**: Based on tap water contaminant data, suggest the right filter type (activated carbon, reverse osmosis, etc.) with affiliate links
- **Real-time price tracking**: Pull current Amazon prices to show actual cost-per-liter comparisons, not just $/$$/$$$
- **Community reviews**: Let users rate and review brands with verified purchase badges
- **Mobile app**: React Native companion app with push notification reminders for hydration tracking
