# Security Guardrails for the MiBarbero Backend Phase

The current MiBarbero MVP is intentionally frontend-only and stores demo data in `localStorage`. That is acceptable for demos, but the first real pilot needs backend auth, authorization, validation, and abuse controls.

## Recommended backend path

| Area | Recommendation |
| --- | --- |
| App framework | Next.js App Router + TypeScript |
| Auth | Supabase Auth with SSR/cookie helpers |
| Database | Supabase Postgres |
| Authorization | Row Level Security on every business table |
| Validation | Zod schemas for every mutation |
| Deployment secrets | Vercel environment variables + Supabase-managed keys |
| Rate limiting | Upstash Redis / Vercel KV-compatible rate limiting |
| CI/security | GitHub Actions, Dependabot, optional CodeQL |

## Production blockers before real customer data

- Protect `/dashboard` and `/admin` with auth.
- Move queue, booking, review, profile, and analytics mutations server-side.
- Stop storing phone numbers, notes, and customer records in `localStorage`.
- Add RLS policies so barbers can only manage their own shop/barber records.
- Add rate limits to queue joins, booking creation, reviews, login/signup, and contact endpoints.
- Validate every write with a server-side schema.
- Validate and normalize external URLs such as Instagram links.
- Add retention/deletion rules for PII.

## Suggested initial schema

```text
profiles
shops
shop_members
barbers
services
clients
queue_entries
appointments
reviews
analytics_events
```

For multi-tenant safety, most tables should include either `shop_id`, `barber_id`, or both. Authorization should generally flow through `shop_members`.

## RLS pattern

Enable RLS on every table exposed through Supabase APIs:

```sql
alter table public.appointments enable row level security;
```

Membership-based policy shape:

```sql
create policy "shop members can view appointments"
on public.appointments
for select
to authenticated
using (
  auth.uid() is not null
  and exists (
    select 1
    from public.shop_members sm
    where sm.shop_id = appointments.shop_id
      and sm.user_id = auth.uid()
  )
);
```

Guardrails:

- Avoid broad `using (true)` policies except intentionally public read-only tables.
- Never expose `service_role` keys in browser code.
- Remember that RLS protects rows, not arbitrary Postgres functions; restrict function `EXECUTE` privileges explicitly.
- Use database constraints for invariant enforcement, not just app code.

## Validation pattern

Every server action/API route that mutates data should have:

1. Zod schema validation.
2. Auth check.
3. Authorization check.
4. Rate-limit decision.
5. Database write.
6. Error handling that does not leak internals.

Example shape:

```ts
const CreateAppointmentSchema = z.object({
  barberId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startsAt: z.string().datetime(),
  customerName: z.string().min(1).max(80),
  customerPhone: z.string().min(7).max(25),
  notes: z.string().max(500).optional(),
});
```

## Secrets rules

- Commit `.env.example`, never `.env`.
- Use Vercel env vars for deployed app configuration.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is allowed client-side, but only if RLS is correct.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and should not be used in ordinary customer/barber flows.
- AI agents should never paste real keys into source files.

## Security headers

Baseline headers should be added early. CSP should start in report-only mode when external asset/script domains are still changing, then tighten before production.

Recommended baseline:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## CI/security baseline

Minimum GitHub checks:

- `npm ci`
- `npm run build`
- `npm run smoke`
- `npm audit --audit-level=high`

Dependabot should monitor:

- npm dependencies
- GitHub Actions

## Source references

- Supabase Next.js SSR auth: https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase API security: https://supabase.com/docs/guides/api/securing-your-api
- Next.js CSP: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
- Next.js headers: https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- OWASP Input Validation Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
- OWASP CSP Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
- GitHub Dependabot: https://docs.github.com/en/code-security/dependabot
- GitHub CodeQL: https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning
- Upstash rate limiting: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
