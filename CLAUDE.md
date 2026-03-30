# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev               # Start Next.js dev server on :3000

# Build & production
npm run build
npm start

# Linting
npm run lint

# Tests (custom tsx runner — no Jest)
npx tsx lib/__tests__/streak.test.ts

# Database
npx prisma migrate dev    # Apply migrations and regenerate client
npx prisma migrate deploy # Apply migrations in production
npx prisma db seed        # Seed with starter coupons
npx prisma studio         # Visual DB browser

# Email
npm run verify-email      # Send a test email to verify SMTP config
```

## Architecture

This is a **Next.js 16 App Router** app with **Prisma + PostgreSQL** (Supabase in production, SQLite for local dev). There is no separate backend — everything runs through Next.js server actions and API routes.

### Data flow

- **Reads** use React Server Components directly querying Prisma (e.g. `app/page.tsx` fetches all coupons server-side)
- **Mutations** go through `app/actions.ts` (server actions) — the only place that writes to the DB and triggers email/streak side effects
- **Real-time UI updates** after mutations use `revalidatePath` (Next.js cache invalidation) + a client-side `window.dispatchEvent` for the streak display

### Authentication

Two independent auth layers, both using **httpOnly cookies**:

1. **App access** — `SecurityModal` triggers `POST /api/auth/magic-word` which emails a random phrase from `lib/magicWords.ts`. Verified phrase sets `auth_token` cookie (24h). The modal reads this cookie on the client to decide whether to show itself.
2. **Admin access** — `/manage` checks `ADMIN_PASSWORD` env var; session cookie valid 24h.

### Streak system

The streak logic is intentionally **pure and database-agnostic**. All core calculations live in `lib/streak.ts` and operate on plain string arrays of dates (`YYYY-MM-DD`). The DB query (`getStreakData`) is separate from the calculation (`computeStreakFromDates`). This makes `lib/__tests__/streak.test.ts` runnable with just `tsx` — no mocking required.

Streak milestones: **3, 7, 14, 30 days**. A streak is live if the last redemption was today or yesterday; a 2+ day gap breaks it.

### Key coupling points

- `app/actions.ts:redeemCoupon` — the central mutation: DB write → email → streak update → cache revalidation. Touch this carefully.
- `lib/email.ts` — fire-and-forget (not awaited in production flow). Failures are silent to the user.
- `Coupon.is_redeemed` is a denormalized flag for quick reads; the source of truth for redemption history is the `Redemption` table.

### Prisma notes

- Two DB URLs are required: `DATABASE_URL` (pooled, for runtime) and `DIRECT_URL` (direct, for migrations). This is a Supabase/PgBouncer requirement.
- The Prisma client is a singleton in `lib/db.ts` to avoid exhausting connections in dev with hot reload.
- `schema.prisma` targets `linux-musl-openssl-3.0.x` as an additional binary target for Docker (Alpine Linux).

### Docker

`next.config.ts` sets `output: "standalone"` so the Docker image only includes the minimal Next.js output. The Dockerfile is multi-stage: deps → builder → runner.
