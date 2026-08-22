# MiBarbero Research + Design Blueprint

This document captures the next-step product, design, and engineering direction for MiBarbero: a bilingual, barber-first live queue and lightweight booking PWA for independent Dominican/Latin community barbers.

## Positioning

MiBarbero should feel less like generic salon SaaS and more like a sharp, social, mobile-first link-in-bio tool for a trusted neighborhood barber.

**Wedge:**

> “Tap my link to see if I’m working, how long the wait is, and join the line before you pull up.”

**Do not copy incumbent salon tools:** avoid forced app downloads, forced card prepayment, corporate POS workflows, or heavy shop-management complexity in the customer flow.

## Design direction

### Visual identity

Current app uses a solid dark/navy + gold palette. Keep the premium barber-shop feel, but add more distinctive visual language:

- **Hero energy:** large status/wait-time modules, layered barber-card previews, and a stronger “live right now” moment.
- **Cultural texture:** subtle Dominican/Latin neighborhood cues, barber-pole striping, sticker/badge motifs, social-proof chips, and “link in bio” language.
- **Mobile-native cards:** make each barber feel like a profile card, not a table row.
- **Action hierarchy:** customer’s primary action should always be obvious: `Join line`, `Book later`, or `Message`.
- **Motion:** small press transitions, status pulse for available barbers, and confirmation microinteractions.

### Suggested screen upgrades

| Screen | Upgrade |
| --- | --- |
| `/` landing | Replace static header with a bold phone-sized live preview, “open now” count, and CTA cards for customers vs barbers. |
| `/shop` | Turn the shop header into an editorial card with cover art, live barber availability summary, and neighborhood trust cues. |
| `/b/[barberId]` | Add a top “barber hero” with avatar/photo, live wait module, social proof, and sticky bottom CTA. |
| `/b/[barberId]/queue` | Convert form into a 3-step flow: service → contact/payment → confirm. Reduce perceived friction. |
| `/dashboard` | Make it feel like a barber cockpit: today’s status, next customer, wait controls, queue lane, bookings lane. |
| `/admin` | Keep pilot metrics, but label it as internal validation rather than a customer-visible admin panel. |

## Design-first generation pipeline

Use AI/app-generation tools as accelerators, but keep a single design contract so outputs do not drift into generic templates.

1. **Product brief first**
   - target user: independent Latin/Dominican community barber
   - customer promise: live availability + wait before pulling up
   - constraints: mobile web, bilingual, cash/Zelle/Cash App/card-at-shop compatible
2. **Moodboard + references**
   - collect 5–10 screenshots for: link-in-bio apps, mobile profile pages, queue/wait modules, appointment selectors, barber branding
3. **Figma or visual spec**
   - define tokens: colors, type scale, radii, spacing, shadows, motion
   - design 3 key frames before generating code: landing, barber profile, queue confirmation
4. **v0 / shadcn / component generation**
   - generate isolated components, not the whole app at once
   - promote good components into `src/components/` and keep data/state wiring separate
5. **Implementation pass**
   - wire components to existing `store.tsx` state and `types/index.ts`
   - preserve bilingual strings in `src/lib/i18n.ts`
6. **Verification pass**
   - `npm run build`
   - `npm run smoke`
   - phone viewport check against the main flows

## Recommended stack path

### Keep now

- Next.js App Router + TypeScript
- Tailwind CSS v4
- LocalStorage MVP data path for demos and pilots
- Playwright smoke script for end-to-end flow coverage

### Add for design polish

- `shadcn/ui` pattern library for accessible components and a consistent design system
- `lucide-react` for consistent icons instead of emoji-only navigation
- `motion` for small, purposeful transitions
- Optional: a proper font pairing, e.g. a display face for headings + readable sans for body

### Add for real pilot backend

- Supabase Postgres + Realtime for live queue/status updates
- Supabase Auth for barber dashboard access; customers can remain anonymous or phone-based initially
- Row Level Security policies from day one
- Zod schemas at every write boundary
- Server actions or route handlers for writes once backend is introduced

## Security-by-default guardrails

Current MVP is intentionally client-only and does **not** include auth. Before a real pilot:

- Add auth for `/dashboard` and `/admin`; never rely on client-side switches for real barber access.
- Move queue, appointment, review, analytics, and barber profile writes behind validated server/API boundaries.
- Use Supabase RLS so a barber can only manage their own queue/profile/bookings.
- Keep customer phone numbers out of analytics events.
- Add rate limits to queue/review submissions.
- Add Dependabot or equivalent dependency alerts.
- Add CI for build + smoke tests before merge.
- Add CSP/security headers in `next.config.ts` once external script/image domains are known.
- Keep secrets server-side; never expose service-role keys through `NEXT_PUBLIC_*`.

## Pilot validation thresholds

Use these before expanding scope:

| Signal | Threshold |
| --- | --- |
| Barber interest | 5 barbers agree to pilot |
| Barber activation | 3 use it 3+ days/week |
| Customer engagement | 10+ customer interactions per active barber/week |
| Value | 2+ barbers say they would pay $10–20/month |
| Operational win | Barbers report fewer “are you available?” DMs/calls |

## Immediate implementation roadmap

1. **Environment hardening**
   - Require Node 20+ / 22 in repo metadata so Tailwind native bindings work consistently.
   - Keep build/smoke verification documented.
2. **Design-system pass**
   - Add a small token/component plan before touching screens.
   - Replace generic emoji-heavy UI with consistent icons and barber-specific visual motifs.
3. **Profile-page redesign**
   - Start with `/b/[barberId]`; it is the most important customer entry point.
   - Add hero, sticky CTA, better wait module, stronger service cards, and trust cues.
4. **Queue-flow redesign**
   - Make the queue join feel like a guided checkout without payment collection.
5. **Backend/security plan**
   - Create Supabase schema + RLS plan before writing backend code.
   - Keep localStorage as demo fallback only.

## Source links for follow-up research

- shadcn/ui docs: https://ui.shadcn.com/docs
- shadcn/ui theming: https://ui.shadcn.com/docs/theming
- v0: https://v0.dev
- Next.js authentication guide: https://nextjs.org/docs/app/guides/authentication
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- GitHub Dependabot docs: https://docs.github.com/en/code-security/dependabot
