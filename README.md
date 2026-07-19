# MiBarbero 💈

**Live queue, bookings, and availability for community barbers.**

A mobile-first PWA MVP for independent Dominican/Latin community barbers in the U.S. The wedge: a barber-first, bilingual (EN/ES), cash-compatible availability + live queue + lightweight booking tool a barber can share from Instagram, WhatsApp, or text:

> "Tap my link to see if I'm working, how long the wait is, and join the line."

This is **not** a salon SaaS clone. No forced app download, no forced card payments, no POS. Pay your way: cash, Zelle, Cash App, or card at the shop.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build (must pass):

```bash
npm run build
npm run start
```

Optional end-to-end smoke test (Playwright, 28 checks across every flow):

```bash
npm run build && npm run start -- -p 3100   # in one terminal
npm run smoke                                # in another
# If Chromium isn't auto-detected: CHROMIUM_PATH=/path/to/chromium npm run smoke
```

## Tech

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **localStorage persistence** — no backend or credentials required; seeded with realistic demo data on first load
- **PWA**: `public/manifest.json`, installable icons, safe-area support, mobile viewport metadata
- Service worker not included yet — add one (e.g. `@serwist/next` or a hand-rolled `public/sw.js` registered in `src/app/layout.tsx`) when offline support is needed.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Landing — hero, search entry point, featured shop's barbers, barber/owner pitches |
| `/shop` | Shop directory — search by city, neighborhood, or ZIP |
| `/shop/[shopId]` | A shop's public front door — shop identity + its barbers |
| `/b/[barberId]` | Public barber profile — status, wait, queue count, services, payments, WhatsApp/Instagram |
| `/b/[barberId]/queue` | Join the line → confirmation with position + estimated wait |
| `/b/[barberId]/book` | Book later — service → day → time slot → payment → confirm |
| `/me` | Customer summary — active queue spots, upcoming bookings, past activity |
| `/dashboard` | Barber dashboard — status toggle, wait time, live queue, walk-ins, today's bookings, client book + CSV export, profile editing, share link |
| `/owner` | Shop owner view — aggregate stats across chairs, roster, shop profile editing |
| `/admin` | Pilot metrics + success criteria panel |

**Layout note (barber-brand-first):** customer-facing "front door" pages (`/shop/[shopId]`, `/b/[barberId]/*`) use minimal MiBarbero chrome — small icon + "Powered by MiBarbero" footer — so the barber's/shop's identity dominates. The app shell (header wordmark + bottom nav) only appears on MiBarbero-owned surfaces (`/`, `/shop` search, `/me`, `/dashboard`, `/owner`, `/admin`).

Demo shops: **Caribe Cuts** (Washington Heights, NY — `luis` available, `manny` busy, `jay` not working) and **Quisqueya Barbershop** (Union City, NJ — `nando`, `bebo`).

## Implemented flows

1. **Customer opens barber link** — polished profile with live status pill, queue-adjusted estimated wait, people waiting, services/prices, accepted payments, working WhatsApp/Instagram links.
2. **Join queue** — name/phone/service/payment/notes → confirmation screen with position (`#2 of 3`), quoted wait, "You're in line" state, leave-the-line option. Queue count updates everywhere.
3. **Book later** — service, next-7-days picker, conflict-aware 30-min slots, payment method (no online payment), optional note → confirmation + shows in `/me`, cancellable.
4. **Barber dashboard** — 3-state status toggle, ±5 min wait stepper with presets, live queue with In chair / Complete / No-show / Cancel, manual walk-in add, today's bookings with Confirm/Arrived/Complete, profile editing, copy-share link. Large tap targets throughout.
5. **Shop search + shop pages** — find a shop by city/neighborhood/ZIP, then browse its barbers with status/wait/queue/specialty/languages; "follow your barber, not the shop" positioning.
6. **Client book (G3)** — each barber's portable client list, rolled up from queue + booking history (visit count, last visit, last service), exportable to CSV at any time from the dashboard.
7. **Shop owner view** — aggregate in-line/bookings/cuts across all chairs, per-chair roster (view-only — owners never see a barber's client book), shop profile editing that flows to the public shop page.
8. **EN/ES toggle** — persists, translates all key UI labels; Spanish written for warmth, not machine-translated (see `src/lib/i18n.ts`).
9. **Metrics** — profile views, queue joins, bookings, completed cuts, no-shows, repeat customers, top payment method, barber activation, pilot success criteria, demo reset.

**Deliberately absent (per PRD non-goals):** no public star ratings or reviews of any kind, no algorithmic ranking of barbers, no forced online payment. Discovery surfaces facts — open/closed, wait, queue length, services, location — not reputation scores.

## What persists in localStorage

Queue entries, bookings, barber status + wait time, barber profile edits, shop profile edits, language preference, analytics events, and which entries/bookings *you* created (drives `/me` and the "you're in line" states). All keys are namespaced `mibarbero:` — see `src/lib/storage.ts`.

## Structure

```
src/
  app/            # routes (App Router)
                  # (app)/ = MiBarbero app shell; shop/, b/ = front-door layouts
  components/     # BarberProfile, QueueForm, BookingForm, BarberDashboard,
                  # OwnerDashboard, ClientBook, ShopSearch, ShopView,
                  # MetricsDashboard, FrontDoorChrome, BottomNav, ...
  data/mockData.ts  # seed shops, barbers, services, queue, bookings
  lib/
    store.tsx     # global state + all mutations (single write path)
    storage.ts    # localStorage layer (Supabase swap point)
    i18n.ts       # EN/ES dictionary + interpolation
    analytics.ts  # event log powering /admin
  types/index.ts  # User, BarberProfile, Shop, Service, QueueEntry,
                  # Appointment, ClientRecord, PaymentMethod, AnalyticsEvent
scripts/          # icon generator, e2e smoke test
public/manifest.json
```

## Known limitations (deliberate for MVP)

- Single-device state: the "customer" and "barber" share one localStorage — real multi-device sync needs the backend.
- No auth — the dashboard's barber switcher stands in for login.
- No SMS/WhatsApp notifications yet (noted in-app on confirmation screens).
- Icons are generated placeholders (`npm run icons`); replace before launch.
- No service worker/offline mode yet.

## Next step: Supabase

`src/lib/store.tsx` is the single write path and `src/lib/storage.ts` the single persistence layer, so the swap is contained:

1. Tables mirroring `src/types`: `shops`, `barbers`, `services`, `queue_entries`, `appointments`, `analytics_events` (seed from `src/data/mockData.ts`).
2. Replace action bodies in `store.tsx` with a small async repository over `@supabase/supabase-js`; subscribe to Realtime on `queue_entries` + `barbers` so the line and status update live for everyone.
3. Supabase Auth (phone OTP) for barbers → dashboard scoped to their own profile; customers stay anonymous (phone captured per entry).
4. Keep localStorage as offline/anonymous fallback.

## Next step: validation with real barbers

1. Deploy (Vercel free tier) and put one pilot barber's `/b/<id>` link in their Instagram bio + WhatsApp status.
2. Have them run one real Saturday on it: status toggle in the morning, walk-ins added as they arrive, wait time nudged between cuts.
3. Watch `/admin` against the pilot criteria: 5 barbers agree to pilot, 3 use it 3+ days/week, 10+ customer interactions per active barber/week, 2+ would pay $10–20/month.
4. The two questions that matter: *did "are you available?" DMs go down* and *did customers actually join the line before pulling up?*
