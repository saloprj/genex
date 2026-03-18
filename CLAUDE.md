# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint

npm run db:generate  # Regenerate Prisma Client after schema changes
npm run db:push      # Push schema to DB (dev, no migration history)
npm run db:migrate   # Create and apply migration (production-safe)
npm run db:seed      # Seed the database
npm run db:studio    # Open Prisma Studio UI
```

No test suite is configured.

## Architecture

**Stack:** Next.js 14 (App Router) + TypeScript, PostgreSQL via Prisma, Supabase Auth, Stripe + Coinbase Commerce payments, Resend email, Zustand cart state, Upstash Redis rate limiting.

### Key path alias
`@/*` maps to `./src/*`

### Route protection (middleware.ts)
- `/shop`, `/cart`, `/checkout`, `/orders` — require authenticated session
- `/admin` — require session + email in `ADMIN_EMAILS` env var
- Unauthenticated requests redirect to `/` with `?next=<path>` for post-login redirect

### Authentication flow
Passwordless OTP/magic link via Supabase Auth + Resend:
1. User submits email on home page → Supabase sends OTP via Resend
2. Link opens `/auth/callback?code=…` → exchanges code for session cookie
3. Middleware validates session server-side on every protected request

**Dev bypass:** When Supabase env vars are missing, `lib/supabase/server.ts` and `lib/supabase/client.ts` return a fake `dev@genexlabs.com` user — no auth needed locally.

### Database (Prisma + Supabase Postgres)
Schema: `prisma/schema.prisma`
Models: `Category`, `Product`, `ProductVariant`, `Order`, `OrderItem`
Enums: `OrderStatus` (PENDING → PAID → PROCESSING → SHIPPED → DELIVERED → CANCELLED → REFUNDED), `PaymentMethod` (STRIPE, CRYPTO)

Two connection strings required:
- `DATABASE_URL` — pooled via pgbouncer (used at runtime)
- `DIRECT_URL` — direct connection (used for migrations)

### Cart state
Zustand store (`src/store/cart.ts`) with `persist` middleware — stored in `localStorage`, never in the database until checkout.

### Checkout flows
Three handlers under `src/app/api/checkout/`:
- `stripe/` — creates Stripe Checkout session
- `crypto/` — creates Coinbase Commerce charge
- `stub/` — test/dev checkout that bypasses payment

Webhooks under `src/app/api/webhooks/` handle payment confirmation and update `Order.status`.

### Email templates
React Email components in `src/emails/`. Rendered and sent via Resend (`src/lib/resend.ts`).

### Environment variables
```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL, DIRECT_URL
STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
COINBASE_COMMERCE_API_KEY, COINBASE_COMMERCE_WEBHOOK_SECRET
RESEND_API_KEY, EMAIL_FROM
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
ADMIN_EMAILS          # comma-separated list of admin email addresses
NEXT_PUBLIC_APP_URL   # defaults to http://localhost:3000
```
