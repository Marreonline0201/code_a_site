# Mineral Water Review & Affiliate Website — Implementation Plan

## Context

Build a content-driven website focused on mineral water education, brand reviews, and comparisons — plus a **hydration tracker** that helps users monitor daily water intake and get smart reminders based on activity and vitals. The site helps people find the right mineral water based on mineral content (magnesium, calcium, silica, etc.) and monetizes through Amazon Associates affiliate links and display ads. The goal is to become the authoritative resource for mineral water information with strong SEO foundations, while the tracker keeps users engaged daily.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js (App Router)** | SSG/ISR for SEO, React ecosystem, API routes built-in |
| Styling | **Tailwind CSS + shadcn/ui** | Fast, consistent, professional design |
| Content | **MDX files** | Easy to write/edit reviews without a CMS, supports rich components |
| Database | **MongoDB (via Mongoose)** | Flexible document model, great for user data + hydration logs |
| Auth | **NextAuth.js (Auth.js v5)** | Supports email/password, Google, GitHub OAuth — session management built-in |
| Scroll & Animation | **Motion (v11+)** + **GSAP + ScrollTrigger** | Scroll reveals, parallax, pinned sequences — both free/MIT |
| Smooth Scroll | **Lenis** | ~4KB butter-smooth scroll normalizer, pairs with Motion/GSAP |
| 3D Ocean Effects | **React Three Fiber + drei** | Realistic water shader for hero, lazy-loaded (`ssr: false`) |
| Deployment | **Vercel** | Free tier, great for Next.js, fast CDN |
| Analytics | **Vercel Analytics** or Google Analytics | Track traffic, affiliate clicks |

---

## UI Design Direction

### Visual Style: Neo-Minimalism + Ocean Theme
- **Clean layouts with warmth** — not sterile white, not cluttered. Soft textures, organic shapes, earthy/ocean palette
- **Glassmorphism** on cards and dashboard widgets — frosted-glass effect with `backdrop-blur`, layered translucency for depth
- **Color palette**: Deep ocean blues, teals, seafoam greens, warm sand neutrals. Calm, non-judgmental tones for tracker UI — avoid red/alert colors for normal variance
- **Bold typography**: Oversized display font on hero and section headings. Variable font that carries visual weight as a layout element
- **Color-coded mineral levels**: Low (sand/neutral) → Medium (teal) → High (deep blue) indicators on brand cards and tables
- **Dark mode**: Ocean-dark theme — deep navy/charcoal backgrounds with glowing teal accents

### Navigation Patterns
- **Desktop**: Sticky top nav with transparent-to-solid transition on scroll. Command palette (CMD+K) for instant brand/mineral/article search
- **Mobile**: Bottom nav bar (thumb-zone design) with 4-5 primary tabs (Home, Brands, Compare, Tracker, Profile). Sticky bottom CTA on content pages
- **Sticky filter bar** on `/brands` — category chips, sort toggles, search field persist on scroll
- **Bottom sheets** on mobile replace full-page modals for quick actions, filters, brand detail previews
- **Progressive disclosure**: Menus, filters, and settings collapse until relevant

### Component Design
- **Brand/product cards**: Glassmorphism card with rating badge top-right, category tag top-left (still/sparkling), 1-2 line title, key mineral highlights, CTA at bottom. Water ripple on hover
- **Comparison tables**: Fixed left column (mineral names), horizontally scrollable brand columns on mobile, highlighted "recommended" column
- **Social proof density**: Star ratings, mineral counts, and price range shown directly on cards — not hidden behind clicks
- **Skeleton loading**: Skeleton screens everywhere instead of spinners. Animated empty states on first tracker visit showing sample data
- **Micro-interactions**: Inline confirmations, animated state changes, count-up numbers when stats enter viewport

### Onboarding & Auth (Trending Patterns)
- **Progressive onboarding**: Registration collects only email + password. Name, weight, activity level, climate gathered in-context on first tracker visit — not a 6-field upfront form
- **Deferred verification wall**: Let new users explore the tracker UI immediately with sample/demo data. Require email verification before data actually persists to DB — show value before asking for commitment
- **Animated empty states**: When tracker is empty, show what it *will* look like with sample data and a gentle "Log your first glass" CTA, not a blank page
- **Contextual tooltips**: Coach marks on first interaction (hovering a mineral chart, first water log) — dismissible, no blocking modals
- **Social login prominent**: Google OAuth as the primary large button, email/password as secondary option below

---

## Scroll Animations & Ocean Effects

### Animation Stack

| Purpose | Tool | Size | Notes |
|---------|------|------|-------|
| Scroll reveals & parallax | **Motion** (`motion/react` v11+) | ~50KB | `whileInView`, `useScroll`, `useTransform` |
| Complex pinned sequences | **GSAP + ScrollTrigger** | ~45KB | Free since 2024 (Webflow acquisition) |
| Smooth scroll feel | **Lenis** (`lenis/react`) | ~4KB | Wrap app in `<ReactLenis root>` |
| Wave section dividers | **CSS + inline SVG** | <1KB | Generate from getwaves.io / svgwave.dev |
| 3D ocean hero | **React Three Fiber + drei `<Water>`** | ~600KB | Lazy-loaded with `next/dynamic({ ssr: false })` |
| Water ripple on hover | **Canvas/WebGL** | lightweight | On brand cards and product cards |
| Floating bubbles | **tsparticles** | ~30KB | Ambient upward-drifting bubbles |

### Scroll Animation Behaviors

**Global (Lenis smooth scroll)**
- `<ReactLenis root>` wraps the app in a client layout provider with `autoRaf: true`
- Normalizes scroll across browsers for a buttery feel

**Scroll Reveals (Motion)**
- Every major section fades + slides up as it enters the viewport:
  ```tsx
  <motion.div
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
  />
  ```
- Brand/mineral cards stagger in one-by-one with `transition={{ delay: index * 0.1 }}`
- Mineral stats count up from 0 when they enter viewport
- Comparison charts draw themselves progressively on scroll

**Parallax (Motion `useScroll` + `useTransform`)**
- Hero section: background image/ocean moves at 0.3x scroll speed, text at 1x
- Brand detail page: header image parallax
- Section backgrounds shift subtly as user scrolls

**Pinned Sequences (GSAP ScrollTrigger) — for premium feel**
- Homepage "How It Works" section: pin the container, step through 3-4 panels as user scrolls
- Comparison page: brand cards slide in from left and right, meet in the center

### Ocean Animation Specs

**1. Animated SVG Wave Dividers**
- Between every major homepage section (hero → top picks → minerals → blog → CTA)
- 2-3 layered SVG `<path>` elements animated with CSS `translateX` keyframes at different speeds
- Ocean-themed gradient fills (deep blue → teal → seafoam)
- Each divider uses a different wave shape for variety
- Pure CSS animation — no JS runtime cost

**2. 3D Ocean Hero (Homepage)**
- Full-width interactive water surface as homepage hero background
- Uses React Three Fiber + drei `<Water>` component (Gerstner wave shader)
- Reacts to mouse/touch movement (subtle wave distortion follows cursor)
- Lazy-loaded: `const OceanHero = dynamic(() => import('./OceanHero'), { ssr: false })`
- Falls back to a static gradient + CSS wave animation if WebGL unavailable
- Color: deep blue-to-teal gradient with light caustics

**3. Parallax Depth Ocean Scene (Homepage scroll)**
```
Layer 1 (back):   Sky gradient               — scrolls at 0.2x speed
Layer 2:          Distant ocean horizon       — scrolls at 0.4x speed
Layer 3:          Animated wave surface (SVG) — scrolls at 0.6x speed
Layer 4:          Floating bubbles/particles  — scrolls at 1.2x speed
Layer 5 (front):  Content text/cards          — scrolls at 1x (normal)
```
Driven by Motion's `useScroll` + `useTransform` on each layer.

**4. Water Ripple on Hover/Click**
- Brand cards and product cards get a ripple effect on hover — water spreading outward from cursor point
- Canvas overlay on each card, triggered on `mouseenter` / `touchstart`
- Subtle, fast (300ms), matches the ocean color palette

**5. Floating Bubbles (Ambient)**
- Homepage hero and tracker dashboard background
- Translucent circles drifting slowly upward with slight horizontal wobble
- Varying sizes (4px–20px), low opacity (0.1–0.3)
- Uses tsparticles with custom "bubbles" config, or pure CSS `@keyframes` for lighter weight
- Reduced motion: respects `prefers-reduced-motion` — static or disabled

**6. Tracker Progress Ring Animation**
- Daily hydration progress ring animates from 0 to current percentage on page load
- Uses Motion's `animate` with spring physics for a satisfying fill
- Water-fill effect inside the ring: blue fill level rises to match percentage
- Celebratory splash animation when user hits 100% of daily goal

### Per-Page Animation Map

| Page | Animations |
|------|------------|
| **Homepage hero** | 3D ocean surface (R3F) + parallax depth layers + floating bubbles + scroll reveal |
| **Homepage sections** | Animated SVG wave dividers between each section + staggered card reveals |
| **Brand index** (`/brands`) | Staggered card grid fade-in + water ripple on card hover + sticky filter bar |
| **Brand detail** | Parallax header image + mineral chart draws on scroll + count-up stats |
| **Mineral pages** | Scroll reveal sections + color-coded level indicators animate in |
| **Comparison** | Brand cards slide in from left/right + side-by-side chart draws progressively |
| **Blog index** | Staggered article card reveals |
| **Blog post** | Paragraphs fade in sequentially + parallax hero image |
| **Tracker dashboard** | Subtle floating bubbles background + progress ring fill animation + water-fill effect |
| **Tracker history** | Chart lines draw on scroll + date cards stagger in |
| **Login / Register** | Subtle wave background + form fades in with spring physics |

### Performance & Accessibility Guardrails
- All 3D/WebGL content lazy-loaded with `next/dynamic({ ssr: false })` — never blocks SSR or initial paint
- `prefers-reduced-motion`: All animations respect this media query. Reduced = instant state, no motion
- Intersection Observer (`viewport: { once: true }`) — animations fire once, not on every scroll pass
- Total animation JS budget: ~130KB (Motion 50 + GSAP 45 + Lenis 4 + tsparticles 30) — acceptable with tree-shaking
- 3D ocean hero (~600KB) loaded only on homepage, only after initial paint (defer)
- No animation on mobile if device has <4GB RAM (check `navigator.deviceMemory`)
- 44px minimum tap targets maintained regardless of animation state
- WCAG AA contrast ratios preserved through all animation states

---

## Site Structure

```
/                           → Homepage — hero, top picks, recent articles
/brands/                    → Brand index page (all brands A-Z with filters)
/brands/[slug]/             → Individual brand page (Evian, Fiji, Gerolsteiner, etc.)
/minerals/                  → Mineral guide index
/minerals/[slug]/           → Individual mineral page (magnesium, calcium, silica, etc.)
/best/                      → "Best water for X" index
/best/[slug]/               → Individual guide (best-for-kidney-stones, best-high-magnesium, etc.)
/compare/                   → Comparison tool landing page
/compare/[brand1]-vs-[brand2]/ → Head-to-head brand comparison
/blog/                      → Blog index
/blog/[slug]/               → Blog posts (health, hydration, news)
/login/                     → Sign in page
/register/                  → Create account page
/tracker/                   → Hydration tracker dashboard (auth required)
/tracker/history/           → Full hydration history (auth required)
/tracker/settings/          → Profile & reminder settings (auth required)
/go/[brand]/                → Server-side affiliate redirect (hides tag)
/privacy/                   → Privacy policy
/terms/                     → Terms of service
/about/                     → About page, editorial policy
```

---

## Data Model

### Mineral (MongoDB `minerals` collection — seeded from JSON)
```json
{
  "_id": "ObjectId",
  "slug": "magnesium",
  "name": "Magnesium",
  "symbol": "Mg",
  "unit": "mg/L",
  "dailyValue": 420,
  "benefits": ["Muscle function", "Sleep quality", "Bone health"],
  "highThreshold": 50,
  "lowThreshold": 10
}
```

### User (MongoDB `users` collection)
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "name": "John",
  "passwordHash": "$2b$10$...",
  "provider": "credentials",
  "emailVerified": false,
  "emailVerificationToken": "<hashed-token>",
  "emailVerificationExpires": "2026-04-11T00:00:00Z",
  "passwordResetToken": "<hashed-token>",
  "passwordResetExpires": "2026-04-10T01:00:00Z",
  "failedLoginAttempts": 0,
  "lockUntil": null,
  "lastLoginAt": "2026-04-10T08:00:00Z",
  "profile": {
    "weight": 75,
    "unit": "kg",
    "activityLevel": "active",
    "climate": "hot",
    "dailyGoal": 3000,
    "wakeTime": "07:00",
    "reminderInterval": 60
  },
  "createdAt": "2026-04-10T00:00:00Z",
  "updatedAt": "2026-04-10T00:00:00Z"
}
```

### Hydration Log (MongoDB `hydration_logs` collection)
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "date": "2026-04-10",
  "goal": 3000,
  "entries": [
    { "time": "08:30", "amount": 250, "brandSlug": null, "activity": null, "note": "morning" },
    { "time": "10:15", "amount": 500, "brandSlug": "gerolsteiner", "activity": "post-workout", "note": "" }
  ],
  "totalMl": 750,
  "createdAt": "2026-04-10T00:00:00Z"
}
```

### Brand (MongoDB `brands` collection — seeded from JSON)
```json
{
  "_id": "ObjectId",
  "slug": "gerolsteiner",
  "name": "Gerolsteiner",
  "origin": "Germany",
  "type": "sparkling",
  "minerals": {
    "calcium": 348,
    "magnesium": 108,
    "sodium": 118,
    "potassium": 11,
    "bicarbonate": 1816,
    "sulfate": 38,
    "chloride": 40,
    "silica": 0,
    "fluoride": 0.2,
    "tds": 2479,
    "ph": 6.2
  },
  "amazonAsin": "B004EPBV4G",
  "image": "/images/brands/gerolsteiner.jpg",
  "tastingNotes": "Strong mineral taste, highly carbonated",
  "rating": 4.5,
  "priceRange": "$$"
}
```

### Smart Reminder Rules
```json
{
  "triggers": [
    { "type": "interval", "minutes": 60, "message": "Time for a glass of water!" },
    { "type": "activity", "event": "post-workout", "amount": 500, "message": "Rehydrate! Drink 500ml after exercise" },
    { "type": "weather", "tempAbove": 30, "extraMl": 500, "message": "It's hot today — drink extra water" },
    { "type": "wake", "minutesAfter": 15, "message": "Start your day with a glass of water" }
  ]
}
```

---

## API Routes (Next.js Route Handlers)

```
POST   /api/auth/register          → Create account (email + hashed password)
POST   /api/auth/[...nextauth]     → NextAuth sign-in/sign-out/session
POST   /api/auth/verify-email      → Verify email with token
POST   /api/auth/forgot-password   → Request password reset email
POST   /api/auth/reset-password    → Reset password with token
GET    /api/brands                 → List all brands (public, cached)
GET    /api/brands/[slug]          → Single brand detail (public, cached)
GET    /api/minerals               → List all minerals (public, cached)
GET    /api/tracker/logs           → Get user's hydration logs (auth required)
POST   /api/tracker/logs           → Add a hydration entry (auth required)
DELETE /api/tracker/logs/[id]      → Delete an entry (auth required, owner only)
GET    /api/tracker/stats          → Get user's 7/30-day stats (auth required)
PUT    /api/user/profile           → Update user profile/goals (auth required)
GET    /api/user/profile           → Get user profile (auth required)
GET    /api/user/export            → Export all user data as JSON (auth required)
DELETE /api/user/account           → Delete account + all data (auth required)
GET    /go/[brand]                 → Server-side affiliate redirect (hides tag from client)
```

---

## Security

### 1. Authentication & Session Management

**Core Auth**
- **NextAuth.js v5** with Credentials provider (email + password) and Google OAuth
- Passwords hashed with **bcrypt** (12 salt rounds minimum)
- JWT sessions stored in **HTTP-only, Secure, SameSite=Strict** cookies
- CSRF token validation on all mutations (built into NextAuth)
- JWT expiry set to **1 hour**, with sliding window refresh on activity
- `NEXTAUTH_SECRET` must be 32+ characters, cryptographically random

**Account Enumeration Protection**
- Login: always return `"Invalid email or password"` — never reveal which field is wrong
- Register: always return `"If this email is available, a verification link has been sent"` — never confirm whether email exists
- Forgot password: always return `"If an account exists, a reset link has been sent"` — same pattern
- This prevents attackers from discovering which emails have accounts

**Email Verification**
- On registration, account is created with `emailVerified: false`
- Send verification email with a **cryptographically random token** (stored hashed in DB, expires in 24h)
- User cannot access `/tracker/*` until email is verified (middleware check)
- Verification tokens are **single-use** — delete after use

**Password Policy**
- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number
- Check against common password list (top 10,000 — bundled, not API call)
- Enforce via Zod schema on both client and server

**Password Reset Flow**
- `POST /api/auth/forgot-password` — accepts email, sends reset link
- Token: cryptographically random, hashed in DB, expires in **1 hour**, single-use
- `POST /api/auth/reset-password` — accepts token + new password
- After reset: invalidate all existing sessions for that user
- Rate limit: max 3 reset requests per email per hour

**OAuth Security**
- Verify `state` parameter to prevent CSRF on OAuth callbacks (NextAuth handles this)
- On OAuth sign-in, if email already exists with `provider: "credentials"`, do NOT auto-link — require the user to sign in with password first and link manually
- This prevents account takeover where attacker creates OAuth with victim's email

**Account Lockout**
- After **5 failed login attempts** within 15 minutes, lock account for 15 minutes
- Track failed attempts per email in DB (not just IP — attacker can rotate IPs)
- Return same generic error message during lockout (don't reveal lockout state)

### 2. Input Validation & Injection Prevention

**Zod Validation on ALL Inputs**
Every API route validates input before processing. Specific limits:

| Field | Type | Constraints |
|-------|------|-------------|
| `email` | string | Valid email format, max 254 chars, lowercase + trimmed |
| `password` | string | 8-128 chars, complexity requirements |
| `name` | string | 1-100 chars, stripped of HTML tags |
| `note` (hydration) | string | Max 200 chars, stripped of HTML tags |
| `amount` (ml) | number | Integer, 1-5000 (no one drinks 5+ liters in one go) |
| `dailyGoal` | number | Integer, 500-10000 ml |
| `weight` | number | 20-500 (kg or lbs, covers all real cases) |
| `reminderInterval` | number | 15-480 minutes |
| `slug` params | string | Regex `/^[a-z0-9][a-z0-9-]{0,98}[a-z0-9]$/` — alphanumeric + hyphens only |
| `entries` array | array | Max 50 entries per day (prevents array bombing) |

**NoSQL Injection Prevention**
- All slug/ID parameters validated with regex BEFORE any DB query
- Never pass raw `req.params` or `req.body` to Mongoose queries
- Use `mongoose.Types.ObjectId.isValid(id)` before any ID-based lookup
- Explicitly use `{ $eq: value }` or string-only fields — never allow objects in query params
- Disable MongoDB operators in user input: reject any string starting with `$`

**XSS Prevention**
- React auto-escapes by default — never use `dangerouslySetInnerHTML` with user content
- Strip HTML from all user text inputs server-side (use a sanitizer like `sanitize-html` on `name`, `note`)
- CSP headers block inline scripts (see headers section below)
- MDX is admin-authored only — never allow user-submitted MDX

**Prototype Pollution Prevention**
- Use `Object.create(null)` or explicit field extraction from request bodies
- Never spread `req.body` directly into objects — pick only expected fields
- Mongoose `schema.set('strict', true)` — reject fields not in schema

### 3. Authorization & Access Control

**Owner-Only Data Access (IDOR Prevention)**
- EVERY query for user data MUST include `userId` from the authenticated session:
  ```
  // CORRECT
  HydrationLog.findOne({ _id: logId, userId: session.user.id })
  
  // WRONG — attacker can guess logId and access other users' data
  HydrationLog.findOne({ _id: logId })
  ```
- This applies to: GET logs, DELETE log, GET stats, GET/PUT profile, DELETE account, GET export
- Create a shared helper `withOwnership(query, session)` to enforce this consistently
- Test with automated checks: attempt cross-user access in verification suite

**Middleware Protection Layers**
```
middleware.ts:
  1. Rate limiting (all routes)
  2. Auth check for /tracker/*, /api/tracker/*, /api/user/*
  3. Email verification check for /tracker/*
  4. CORS enforcement for /api/*
```

**HTTP Method Enforcement**
- Each route handler only exports the methods it supports (GET, POST, etc.)
- Next.js App Router handles this — but verify no catch-all handlers

### 4. Rate Limiting (All Routes)

| Route Pattern | Limit | Window | Key |
|---------------|-------|--------|-----|
| `POST /api/auth/register` | 3 requests | 15 min | IP |
| `POST /api/auth/[...nextauth]` (sign-in) | 5 requests | 15 min | IP + email |
| `POST /api/auth/forgot-password` | 3 requests | 60 min | IP + email |
| `POST /api/auth/reset-password` | 5 requests | 60 min | IP |
| `POST /api/auth/verify-email` | 5 requests | 15 min | IP |
| `POST /api/tracker/logs` | 60 requests | 1 min | userId |
| `DELETE /api/tracker/logs/[id]` | 30 requests | 1 min | userId |
| `PUT /api/user/profile` | 10 requests | 1 min | userId |
| `GET /api/tracker/*` | 60 requests | 1 min | userId |
| `GET /api/brands`, `/api/minerals` | 100 requests | 1 min | IP |
| `GET /api/user/export` | 1 request | 10 min | userId |
| `DELETE /api/user/account` | 1 request | 60 min | userId |
| `GET /go/[brand]` | 30 requests | 1 min | IP |

Implementation: in-memory store for development, Redis-backed for production (or Vercel KV via Marketplace).
Return `429 Too Many Requests` with `Retry-After` header. Never reveal why the limit exists.

### 5. Database Security

**Connection & Access**
- MongoDB connection string in `MONGODB_URI` env var — never committed, never logged
- MongoDB Atlas: create a **dedicated database user** with read/write only to the app database (not admin)
- IP allowlist on MongoDB Atlas — restrict to Vercel's IP ranges in production
- Connection pooling via singleton (`lib/mongodb.ts`) — prevents connection exhaustion
- Set `serverSelectionTimeoutMS: 5000` and `socketTimeoutMS: 45000` on connection

**Schema Enforcement**
- `strict: true` on all Mongoose schemas — reject unknown fields
- Required fields enforced at schema level (not just Zod)
- Indexes:
  - `users.email` — unique, sparse
  - `users.emailVerificationToken` — sparse (only exists when pending)
  - `users.passwordResetToken` — sparse, TTL index (auto-delete after 1 hour)
  - `hydration_logs.userId + date` — compound, for fast per-user queries
  - `hydration_logs.userId` — for account deletion cascading

**Query Safety**
- Always use Mongoose parameterized methods (`.findOne()`, `.find()`, `.updateOne()`)
- Never use `$where` or pass user input to aggregation `$expr`
- Pagination on all list endpoints: default `limit: 30`, max `limit: 100`
- Sort by indexed fields only — prevent full collection scans

**Data Sensitivity**
- Password hashes never returned in API responses — use Mongoose `select: '-passwordHash'` on User queries
- Email returned only to the account owner (not in public-facing data)
- MongoDB ObjectIDs are somewhat sequential — don't rely on them being secret (use `userId` ownership checks, not obscurity)

### 6. Security Headers (`next.config.ts`)

```typescript
headers: [
  {
    source: '/(.*)',
    headers: [
      // Prevent clickjacking
      { key: 'X-Frame-Options', value: 'DENY' },
      // Prevent MIME type sniffing
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Control referrer information
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // HSTS — force HTTPS for 1 year + subdomains
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
      // CSP — strict content security policy
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://accounts.google.com; frame-ancestors 'none'; form-action 'self'; base-uri 'self'" },
      // Disable browser features we don't use
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
      // Prevent caching of authenticated pages
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
    ]
  },
  {
    source: '/api/(.*)',
    headers: [
      // No caching on API responses by default
      { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
    ]
  },
  {
    source: '/api/brands/(.*)',
    headers: [
      // Public brand data can be cached
      { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
    ]
  }
]
```

### 7. CORS Configuration

- `/api/tracker/*` and `/api/user/*` — **same-origin only** (reject all cross-origin requests)
- `/api/brands/*` and `/api/minerals/*` — allow cross-origin reads (public data)
- `/api/auth/*` — same-origin only
- Explicitly set `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`
- Never use `Access-Control-Allow-Origin: *` on authenticated endpoints

### 8. Affiliate Link Protection

**Server-Side Redirect (Hide Affiliate Tag)**
- Instead of exposing `https://amazon.com/dp/ASIN?tag=YOUR_TAG` in client HTML:
  - Client links point to `/go/[brand-slug]`
  - Server route looks up ASIN from DB, appends affiliate tag, returns `302 redirect`
  - Affiliate tag never appears in page source — harder for extensions/proxies to strip
- Add `rel="noopener noreferrer sponsored"` to all outbound links
- Log redirect counts for revenue tracking

### 9. Error Handling & Information Leakage

**Never Expose Internal Errors**
- Catch all errors in API routes — return generic messages to the client
- `500` responses: `{ "error": "Something went wrong" }` — never stack traces, file paths, or query details
- Log full errors server-side (Vercel logs) for debugging
- Mongoose validation errors: return `400` with field names only, not schema details
- Next.js custom error pages: `/not-found.tsx` and `/error.tsx` — no technical details shown

**Source Maps**
- Disable source maps in production: `productionBrowserSourceMaps: false` in `next.config.ts`
- This prevents attackers from reading your original source code in browser devtools

### 10. Data Privacy & Compliance

**GDPR / CCPA Essentials**
- `GET /api/user/export` — returns all user data as JSON (profile, all hydration logs)
  - Rate limited: 1 request per 10 minutes
  - Returns downloadable JSON file
- `DELETE /api/user/account` — permanent account deletion
  - Requires password confirmation (or re-auth for OAuth users)
  - Deletes: user record, all hydration logs, all tokens
  - Irreversible — warn user with confirmation step
  - Log deletion event (without PII) for audit trail

**Privacy Considerations**
- Hydration logs contain health-adjacent data (weight, activity, intake) — treat as sensitive
- Never share user data with third parties (beyond what's in the privacy policy)
- Add a **Privacy Policy** page (`/privacy`) — required for Google OAuth and Amazon Associates
- Add a **Terms of Service** page (`/terms`)
- Cookie consent banner (required in EU) — for analytics cookies, not auth (auth cookies are exempt as "strictly necessary")

**Data Retention**
- Hydration logs: kept indefinitely while account is active (user can delete individual entries)
- Verification tokens: auto-expire after 24 hours (TTL index in MongoDB)
- Password reset tokens: auto-expire after 1 hour (TTL index)
- Failed login attempts: auto-expire after 24 hours (TTL index)
- Deleted accounts: all data purged immediately, not soft-deleted

### 11. Monitoring, Logging & Incident Response

**What to Log (Server-Side)**
- Failed login attempts (email, IP, timestamp — not password)
- Successful logins (userId, IP, timestamp)
- Registration events (IP, timestamp)
- Rate limit hits (route, IP, timestamp)
- Account deletions (timestamp only, no PII)
- Password reset requests (email hash, timestamp)
- Authorization failures (userId tried to access resourceId they don't own)
- Any 500 errors with full stack trace

**What NEVER to Log**
- Passwords (plain or hashed)
- Full email addresses in plaintext (use hashed or truncated)
- JWT tokens or session secrets
- MongoDB connection strings

**Alerting (v1 — Basic)**
- Monitor Vercel deployment logs for spikes in 401/403/429 responses
- Set up Vercel log drain to catch repeated error patterns
- Review logs weekly for suspicious patterns

**Incident Response Plan**
- If `NEXTAUTH_SECRET` is leaked: rotate immediately, all sessions invalidate
- If database is breached: passwords are bcrypt-hashed (safe), but force all password resets via email
- If OAuth credentials leak: revoke in Google Console immediately, rotate

### 12. Dependency & Supply Chain Security

- Run `npm audit` before every deployment — fix critical/high vulnerabilities
- Pin exact dependency versions in `package-lock.json` (npm does this by default)
- Review new dependencies before adding — check download counts, last publish date, maintainers
- Never install packages with `postinstall` scripts you haven't reviewed
- Keep Next.js, NextAuth, Mongoose on latest stable versions
- Add `npm audit` to CI/CD pipeline (fail build on critical vulnerabilities)

### 13. Deployment Security (Vercel)

- **Preview deployments**: password-protect or restrict to team members — preview URLs are public by default and could expose staging features
- **Environment variables**: use Vercel's env var system — separate values for Preview vs Production
- **Build output**: verify no `.env` files or secrets in the build output
- **Domain**: configure DNSSEC if registrar supports it
- **HTTPS**: enforced by Vercel (automatic TLS certificates)

### 14. Client-Side Security

- Never store tokens, secrets, or sensitive data in `localStorage` or `sessionStorage`
- Auth state managed via HTTP-only cookies only (NextAuth handles this)
- Notification API: only request permission when user explicitly clicks "Enable Reminders" — not on page load (browsers penalize auto-prompts)
- All external links use `rel="noopener noreferrer"` — prevents `window.opener` attacks
- No `eval()`, no `new Function()`, no dynamic script injection
- Disable React devtools in production (`__REACT_DEVTOOLS_GLOBAL_HOOK__`)

### Environment Variables

```
# Server-only secrets (NEVER prefix with NEXT_PUBLIC_)
MONGODB_URI=mongodb+srv://appuser:strongpassword@cluster.mongodb.net/mineralwater
NEXTAUTH_SECRET=<64-char-cryptographically-random-string>
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=noreply@yourdomain.com
EMAIL_SERVER_PASSWORD=<smtp-password>
EMAIL_FROM=noreply@yourdomain.com

# Client-safe (public — okay to expose in browser)
NEXT_PUBLIC_AMAZON_TAG=your-affiliate-tag
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## Implementation Steps

### Step 1: Project Setup
- `npx create-next-app@latest` with App Router, TypeScript, Tailwind CSS
- Install shadcn/ui and configure base components
- Install animation stack: `motion`, `gsap`, `@gsap/react`, `lenis`, `@react-three/fiber`, `@react-three/drei`, `three`, `tsparticles`, `@tsparticles/react`
- Set up project structure (`/app`, `/data`, `/components`, `/lib`)
- Configure Lenis smooth scroll provider (client component wrapping root layout)
- Configure basic layout with header (transparent-to-solid on scroll), footer, navigation
- Set up bottom nav bar for mobile (thumb-zone layout)
- Add CMD+K command palette for brand/mineral/article search
- Define ocean color palette in Tailwind config (deep blues, teals, seafoam, sand neutrals) + dark mode ocean-dark theme
- Add SEO defaults (metadata, sitemap, robots.txt)
- Configure `.env.local` with all secrets (MongoDB URI, NextAuth secret, SMTP, OAuth)
- Add full security headers in `next.config.ts` (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- Disable production source maps (`productionBrowserSourceMaps: false`)
- Set up `.gitignore` (`.env*`, `node_modules`, `.next`)

### Step 2: Database & Auth
- Install `mongoose`, `next-auth`, `bcrypt`, `zod`, `sanitize-html`, `nodemailer`
- Set up MongoDB connection singleton (`lib/mongodb.ts`) with connection pooling and timeouts
- Define Mongoose schemas with `strict: true`:
  - `User` — includes `emailVerified`, `failedLoginAttempts`, `lockUntil`, token fields, TTL indexes
  - `Brand`, `Mineral` — read-only content, seeded from JSON
  - `HydrationLog` — compound index on `userId + date`
- Configure NextAuth with Credentials + Google providers:
  - JWT expiry: 1 hour with sliding window
  - Account enumeration protection on all auth responses
  - OAuth account linking protection (don't auto-merge with existing email)
- Build registration API route:
  - Password hashing (bcrypt 12 rounds)
  - Password policy enforcement (8+ chars, complexity, common password check)
  - Email verification token generation + email sending
  - Account created with `emailVerified: false`
- Build email verification route (`/api/auth/verify-email`)
- Build password reset flow (`/api/auth/forgot-password` + `/api/auth/reset-password`)
- Create auth middleware helper (`lib/auth-guard.ts`):
  - Session validation
  - Email verification check for tracker routes
  - Owner-only data access helper (`withOwnership`)
- Build rate limiting middleware (`lib/rate-limit.ts`) — apply to ALL routes with per-route configs
- Account lockout logic (5 failed attempts → 15 min lock)
- Build seed script to populate brands and minerals from JSON files
- Configure CORS for protected vs public routes

### Step 3: Data Layer
- Create JSON seed files for 15-20 initial brands with mineral profiles
- Create mineral reference seed data (8-10 key minerals)
- Build utility functions to query/filter/sort brand data from MongoDB
- Create TypeScript types for Brand, Mineral, User, HydrationLog
- Add Zod validation schemas for all API inputs

### Step 3: Core Pages
- **Homepage**: 3D ocean hero (R3F, lazy-loaded) with parallax depth layers + floating bubbles. Animated SVG wave dividers between sections. "Top Picks" grid (staggered card reveals), mineral quick-links, recent articles. Pinned "How It Works" scroll sequence (GSAP)
- **Brand index** (`/brands`): Sticky filter bar (chips, sort, search). Glassmorphism card grid with staggered fade-in on scroll. Water ripple effect on card hover. Rating badges + mineral highlights visible on cards
- **Brand detail** (`/brands/[slug]`): Parallax header image. Mineral breakdown table with count-up animation on scroll. Radar chart draws progressively. Amazon affiliate button, taste notes, similar brands
- **Mineral index** (`/minerals`): Cards with color-coded level indicators (sand → teal → deep blue) animate in on scroll
- **Mineral detail** (`/minerals/[slug]`): What it does, daily recommended intake, top brands ranked by this mineral with scroll reveals

### Step 4: Comparison & "Best For" Pages
- **Comparison page** (`/compare/[brand1]-vs-[brand2]`): Brand cards slide in from left/right (GSAP). Side-by-side mineral table (fixed left column, scrollable on mobile, highlighted "recommended"). Chart draws progressively on scroll. Verdict section fades in
- **Best-for pages** (`/best/[slug]`): Curated lists like "Best Water High in Magnesium", "Best Water for Athletes" with staggered card reveals
- Comparison selector tool on `/compare`

### Step 5: Blog / MDX Content
- Set up MDX processing with `next-mdx-remote` or `@next/mdx`
- Create blog layout and index page
- Write 2-3 seed articles (e.g., "How Minerals in Water Affect Taste", "Why TDS Matters")

### Step 6: Amazon Affiliate Integration
- Create reusable `<AffiliateButton>` component with Amazon tag parameter
- Build `<ProductCard>` component showing brand image, key stats, price range, and "Check on Amazon" CTA
- Add Amazon affiliate disclaimer in footer and on relevant pages
- Generate Amazon links from ASIN + affiliate tag

### Step 7: SEO & Performance
- Generate `sitemap.xml` dynamically from all brand/mineral/comparison pages
- Add JSON-LD structured data (Product, Review, FAQPage schemas)
- Open Graph and Twitter Card meta tags per page
- Image optimization with `next/image`
- Static generation (SSG) for all data-driven pages

### Step 8: Hydration Tracker (`/tracker`)
- **Dashboard UI**: Daily progress ring with water-fill animation (Motion spring physics). Ring animates from 0 to current % on page load. Blue fill level rises inside ring to match. Celebratory splash animation at 100%. Subtle floating bubbles background
- **Quick-log buttons**: Tap to add common amounts (250ml glass, 500ml bottle, custom). Optimistic UI — show logged water immediately, sync in background. Inline confirmation micro-interaction (no modal)
- **Activity logging**: Log workouts, outdoor time — adjusts daily goal upward
- **Smart reminders**: Browser push notifications (via Notification API) based on:
  - Time intervals (every 60 min if no log)
  - Post-activity reminders (log a workout → get "rehydrate" nudge)
  - Wake-up reminder (configurable morning time)
  - Weather-based (optional — fetch local temp, suggest extra intake on hot days)
- **Smartwatch vitals integration**: Info page explaining how to check heart rate, body temp from popular watches (Apple Watch, Garmin, Fitbit) and when those signals mean "drink water" (elevated HR, high body temp, post-exercise recovery)
- **History view**: Past 7/30 days chart — lines draw on scroll, date cards stagger in. Organic wave chart style (not harsh line chart)
- **Profile setup**: Progressive — collected in-context on first tracker visit, not upfront registration form. Weight, activity level, climate → calculates personalized daily goal
- **Animated empty state**: First visit shows what the tracker looks like with sample data + gentle "Log your first glass" CTA. Contextual tooltips on first interaction
- **Data synced to MongoDB** — user must be signed in, data persists across devices
- **Brand tie-in**: When logging, optionally select which mineral water brand → links to brand page

### Step 9: Design Polish & Animation Integration
- Responsive design (mobile-first): bottom nav on mobile, collapsible sidebar on tablet, full nav on desktop
- Mineral comparison charts (radar charts with progressive draw animation)
- Brand rating display (star ratings or score badges) — glassmorphism card style
- Color-coded mineral levels: sand/neutral (low) → teal (medium) → deep blue (high)
- Dark mode: ocean-dark theme (deep navy/charcoal backgrounds, glowing teal accents)
- Lenis smooth scroll integration across all pages
- Motion scroll reveals on all sections (`whileInView` with `once: true`)
- GSAP pinned scroll sequences on homepage "How It Works"
- SVG wave dividers between all major sections (generated, CSS-animated)
- 3D ocean hero on homepage (R3F + drei `<Water>`, lazy-loaded, WebGL fallback)
- Water ripple hover effect on all brand/product cards
- Floating bubbles ambient on hero + tracker dashboard
- Parallax depth layers on homepage and brand detail headers
- Count-up number animations on mineral stats entering viewport
- Progress ring water-fill animation on tracker
- Skeleton loading screens everywhere (no spinners)
- `prefers-reduced-motion` respected: all animations disabled/instant for users who prefer it
- 44px minimum tap targets maintained through all animation states
- WCAG AA contrast ratios preserved in all states (light + dark + animated)

---

## Affiliate Link Strategy

```
https://www.amazon.com/dp/{ASIN}?tag={AFFILIATE_TAG}
```

- Store affiliate tag in environment variable (`NEXT_PUBLIC_AMAZON_TAG`)
- Generate links dynamically from brand ASIN data
- Include FTC-compliant disclosure on every page with affiliate links

---

## Initial Brand List (Seed Data)

1. Evian
2. Fiji
3. Gerolsteiner
4. San Pellegrino
5. Perrier
6. Voss
7. Essentia
8. Smartwater
9. Topo Chico
10. Mountain Valley
11. Acqua Panna
12. Waiakea
13. Icelandic Glacial
14. Liquid Death
15. Flow

---

## Verification / Testing

**Functional**
1. Run `npm run dev` and verify all routes render correctly
2. Check that brand pages display mineral data accurately
3. Verify `/go/[brand]` redirect works and affiliate tag is NOT in page source
4. Test comparison pages with different brand pairs
5. Confirm MDX blog posts render properly
6. Test hydration tracker: log water, verify progress updates in DB
7. Test browser notifications fire correctly on reminder intervals
8. Verify daily goal recalculates when profile changes
9. Test history chart renders correctly with multiple days of data

**Authentication**
10. Register — verify password is bcrypt hashed in DB (not plaintext)
11. Register — verify account starts with `emailVerified: false`
12. Register — verify verification email is sent with valid token
13. Verify email — confirm `emailVerified` flips to `true` after clicking link
14. Verify email — confirm token is single-use (second click fails)
15. Verify email — confirm expired token (>24h) is rejected
16. Unverified user cannot access `/tracker/*` — redirected to "verify your email" page
17. Sign in with correct credentials — verify JWT cookie is HTTP-only, Secure, SameSite=Strict
18. Sign in with wrong password — verify generic "Invalid email or password" message
19. Sign in with non-existent email — verify SAME generic message (no enumeration)
20. Register with existing email — verify generic "verification link sent" message (no enumeration)
21. Forgot password with existing email — verify generic "reset link sent" message
22. Forgot password with non-existent email — verify SAME generic message
23. Password reset — verify token works, password changes, old sessions invalidated
24. Password reset — verify expired token (>1h) is rejected
25. Google OAuth sign-in — verify new account created in DB
26. Google OAuth with email that already has password account — verify NO auto-link (require manual link)
27. Weak password rejected — test "password", "12345678", "qwerty123"

**Account Lockout**
28. 5 failed logins in 15 min → account locked, same generic error returned
29. After 15 min lockout expires → can login again
30. Successful login resets failed attempt counter

**Authorization (IDOR)**
31. User A cannot GET User B's hydration logs — returns empty/403
32. User A cannot DELETE User B's hydration log entry — returns 403
33. User A cannot GET User B's profile — returns 403
34. User A cannot PUT to User B's profile — returns 403
35. Access any `/api/tracker/*` or `/api/user/*` without auth — returns 401

**Rate Limiting**
36. Hit `POST /api/auth/register` 4 times in 15 min → 4th request returns 429
37. Hit `POST /api/auth/[...nextauth]` (login) 6 times in 15 min → 6th returns 429
38. Hit `POST /api/tracker/logs` 61 times in 1 min → 61st returns 429
39. Verify 429 response includes `Retry-After` header
40. Verify rate limits are per-route (hitting login limit doesn't affect tracker)

**Input Validation**
41. Send hydration amount of -100 → rejected with 400
42. Send hydration amount of 999999 → rejected with 400
43. Send note with 10,000 characters → rejected with 400
44. Send note with `<script>alert(1)</script>` → HTML stripped, no XSS
45. Send slug with `{"$gt":""}` → rejected with 400
46. Send invalid ObjectId to DELETE → rejected with 400
47. Send extra fields not in schema → rejected (strict mode)
48. Send empty body to POST routes → rejected with 400

**NoSQL Injection**
49. Brand slug: `{"$gt":""}` → rejected before DB query
50. Log ID: `{"$ne":null}` → rejected before DB query
51. Email field with MongoDB operator → rejected by Zod

**Headers & Transport**
52. Check `X-Frame-Options: DENY` present
53. Check `X-Content-Type-Options: nosniff` present
54. Check `Strict-Transport-Security` with `max-age=31536000`
55. Check `Content-Security-Policy` blocks inline scripts
56. Check `Referrer-Policy: strict-origin-when-cross-origin`
57. Check `Permissions-Policy` disables camera/mic/geolocation
58. Check no source maps in production build
59. Check API error responses don't leak stack traces or file paths

**CORS**
60. Cross-origin request to `/api/tracker/logs` → blocked
61. Cross-origin request to `/api/brands` → allowed (public data)

**Data Privacy**
62. `GET /api/user/export` — returns complete user data as JSON
63. `DELETE /api/user/account` — deletes user + all hydration logs + all tokens
64. Verify deleted user's data is completely gone from DB (not soft-deleted)
65. Verify password hash is NEVER returned in any API response
66. Verify email is only returned to the account owner

**Performance & SEO**
67. Test responsive design at mobile/tablet/desktop breakpoints
68. Run Lighthouse audit — target 90+ on Performance, SEO, Accessibility
69. Verify sitemap.xml includes all generated pages
70. Run `npm run build` — verify no build errors and pages are statically generated where expected
71. Run `npm audit` — verify no critical or high vulnerabilities

---

## File Tree (Target)

```
code_a_site/
├── app/
│   ├── layout.tsx                  # Root layout, nav, footer, session provider
│   ├── page.tsx                    # Homepage
│   ├── login/page.tsx              # Sign in page (wave background, spring form fade-in)
│   ├── register/page.tsx           # Create account (progressive — email+password only)
│   ├── brands/
│   │   ├── page.tsx                # Brand index
│   │   └── [slug]/page.tsx         # Brand detail
│   ├── minerals/
│   │   ├── page.tsx                # Mineral index
│   │   └── [slug]/page.tsx         # Mineral detail
│   ├── best/
│   │   ├── page.tsx                # Best-for index
│   │   └── [slug]/page.tsx         # Best-for guide
│   ├── compare/
│   │   ├── page.tsx                # Comparison tool
│   │   └── [slug]/page.tsx         # Brand vs Brand
│   ├── blog/
│   │   ├── page.tsx                # Blog index
│   │   └── [slug]/page.tsx         # Blog post
│   ├── tracker/
│   │   ├── page.tsx                # Hydration tracker dashboard
│   │   ├── history/page.tsx        # Full history view
│   │   └── settings/page.tsx       # Profile & reminder settings
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts    # NextAuth handler
│   │   │   ├── register/route.ts         # Registration + email verification send
│   │   │   ├── verify-email/route.ts     # Email verification endpoint
│   │   │   ├── forgot-password/route.ts  # Password reset request
│   │   │   └── reset-password/route.ts   # Password reset with token
│   │   ├── brands/
│   │   │   ├── route.ts                  # List brands
│   │   │   └── [slug]/route.ts           # Single brand
│   │   ├── minerals/route.ts             # List minerals
│   │   ├── tracker/
│   │   │   ├── logs/route.ts             # GET/POST hydration logs
│   │   │   ├── logs/[id]/route.ts        # DELETE single entry
│   │   │   └── stats/route.ts            # GET aggregated stats
│   │   └── user/
│   │       ├── profile/route.ts          # GET/PUT user profile
│   │       ├── export/route.ts           # GET full data export
│   │       └── account/route.ts          # DELETE account + all data
│   ├── go/
│   │   └── [brand]/route.ts          # Server-side affiliate redirect
│   ├── privacy/page.tsx              # Privacy policy
│   ├── terms/page.tsx                # Terms of service
│   ├── about/page.tsx                # About page
│   └── sitemap.ts                    # Dynamic sitemap
├── components/
│   ├── ui/                         # shadcn components
│   ├── auth/
│   │   ├── LoginForm.tsx           # Email/password + OAuth sign-in
│   │   ├── RegisterForm.tsx        # Registration form
│   │   └── AuthGuard.tsx           # Protect client routes
│   ├── animation/
│   │   ├── LenisProvider.tsx       # Smooth scroll wrapper ("use client")
│   │   ├── ScrollReveal.tsx        # Reusable Motion whileInView wrapper
│   │   ├── ParallaxLayer.tsx       # Motion useScroll + useTransform parallax
│   │   ├── CountUp.tsx             # Number count-up on viewport enter
│   │   ├── StaggerGrid.tsx         # Staggered children reveal on scroll
│   │   ├── WaveDivider.tsx         # Animated SVG wave section divider
│   │   ├── WaterRipple.tsx         # Canvas ripple effect for card hover
│   │   ├── FloatingBubbles.tsx     # tsparticles ambient bubble config
│   │   └── OceanHero.tsx           # R3F + drei Water shader (lazy-loaded)
│   ├── AffiliateButton.tsx
│   ├── ProductCard.tsx             # Glassmorphism card + water ripple hover
│   ├── MineralTable.tsx
│   ├── MineralChart.tsx            # Radar chart with progressive draw
│   ├── ComparisonTable.tsx         # Fixed left col, scrollable on mobile
│   ├── BrandGrid.tsx               # StaggerGrid of ProductCards
│   ├── CommandPalette.tsx          # CMD+K search for brands/minerals/articles
│   ├── BottomNav.tsx               # Mobile thumb-zone bottom navigation
│   ├── SkeletonCard.tsx            # Skeleton loading placeholder
│   ├── tracker/
│   │   ├── HydrationDashboard.tsx  # Progress ring with water-fill + bubbles
│   │   ├── WaterLogForm.tsx        # Quick-log with optimistic UI
│   │   ├── ActivityLogger.tsx      # Log workouts/activities
│   │   ├── ReminderSettings.tsx    # Configure notification triggers
│   │   ├── HistoryChart.tsx        # Wave-style trend chart, draws on scroll
│   │   ├── ProfileSetup.tsx        # Progressive in-context setup
│   │   └── EmptyState.tsx          # Animated empty state with sample data
│   ├── Header.tsx                  # Transparent-to-solid on scroll
│   └── Footer.tsx
├── models/                         # Mongoose schemas
│   ├── User.ts
│   ├── Brand.ts
│   ├── Mineral.ts
│   └── HydrationLog.ts
├── lib/
│   ├── mongodb.ts                  # MongoDB connection singleton (pooling + timeouts)
│   ├── auth.ts                     # NextAuth config (JWT expiry, providers, callbacks)
│   ├── auth-guard.ts               # Session check, email verify check, withOwnership helper
│   ├── rate-limit.ts               # Per-route rate limiting with configurable limits
│   ├── cors.ts                     # CORS helper (same-origin for auth, open for public)
│   ├── validations.ts              # Zod schemas for ALL API inputs (strict field limits)
│   ├── sanitize.ts                 # HTML stripping for user text fields
│   ├── email.ts                    # Nodemailer setup: verification, password reset emails
│   ├── tokens.ts                   # Crypto token generation + hashing helpers
│   ├── password.ts                 # Bcrypt + password policy (complexity + common check)
│   ├── brands.ts                   # Brand data utilities
│   ├── minerals.ts                 # Mineral data utilities
│   ├── amazon.ts                   # Affiliate link generator
│   ├── hydration.ts                # Goal calculator, reminder logic
│   └── types.ts                    # TypeScript types
├── data/
│   ├── seed/                       # JSON seed files
│   │   ├── brands.json
│   │   └── minerals.json
│   └── best-for.json               # Best-for list configs
├── scripts/
│   └── seed.ts                     # DB seed script (run once to populate)
├── middleware.ts                    # NextAuth + rate limit middleware
├── content/
│   └── blog/                       # MDX blog posts
├── public/
│   └── images/brands/              # Brand bottle images
├── data/
│   └── common-passwords.txt        # Top 10,000 common passwords for policy check
├── .env.local                      # Secrets (MONGODB_URI, NEXTAUTH_SECRET, etc.)
├── .gitignore                      # Includes .env.local, .env*, node_modules, .next
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Future Enhancements (Not in v1)

- Search functionality
- User reviews / ratings (NOTE: requires XSS-safe rendering — never allow user MDX)
- Email newsletter signup (double opt-in required)
- Water quality by zip code lookup
- Subscription box partnerships
- Comparison tool with multi-select
- Smartwatch direct API integration (Apple HealthKit via web, Google Fit API)
- Social features — share hydration streaks
- Admin dashboard for managing brands/content (requires role-based access control)
- PWA (installable app) with offline support and background notifications
- Two-factor authentication (TOTP via authenticator app)
- Session management page (view/revoke active sessions)
- Web Application Firewall (WAF) rules on Vercel
- Penetration testing by third party before scaling
