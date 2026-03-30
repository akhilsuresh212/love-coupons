# Love Coupons

A personalized digital love coupon app — made with all the love in the world, just for my beautiful wife.

Redeem experiences, track romantic streaks, spin the jackpot wheel, and keep memories alive through notes.

---

## Features

- **Coupon Gallery** — Browse all love coupons organized in a beautiful masonry grid with category badges and redemption status
- **Redemption Flow** — Redeem coupons with optional memory notes and confetti celebrations
- **Jackpot Wheel** — Spin to get a random unredeemed coupon with casino-style Lottie animation
- **Streak Tracker** — Gamified romance streak with milestones (3, 7, 14, 30 days), progress bars, and celebration modals
- **Magic Word Auth** — Email-based authentication; a secret phrase is sent to unlock the app
- **Admin Dashboard** — Password-protected panel to create, edit, and manage coupons and categories
- **Email Notifications** — Automated emails on redemption and magic word delivery via Nodemailer + Brevo SMTP
- **Docker Support** — Ready-to-run Docker and docker-compose setup

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, Framer Motion |
| Database | PostgreSQL (Supabase) via Prisma ORM |
| Email | Nodemailer + Brevo SMTP |
| Animation | Lottie React, Canvas Confetti |
| Icons | Lucide React |
| Deployment | Docker (standalone Next.js output) |

---

## Project Structure

```
love-coupons/
├── app/
│   ├── api/
│   │   ├── auth/magic-word/    # Magic word email auth endpoint
│   │   └── streak/             # Streak data API
│   ├── coupon/[id]/            # Coupon detail & redemption page
│   ├── manage/                 # Admin dashboard
│   ├── spin/                   # Jackpot spin wheel
│   ├── page.tsx                # Home — coupon gallery
│   ├── layout.tsx              # Root layout
│   └── actions.ts              # Server actions (redeem, etc.)
├── components/
│   ├── admin/                  # Admin UI (login, dashboard, managers)
│   ├── ui/                     # Reusable primitives (Button, Card, Modal…)
│   ├── CouponCard.tsx
│   ├── Jackpot.tsx
│   ├── RedeemFlow.tsx
│   ├── SecurityModal.tsx       # Magic word gate
│   └── StreakDisplay.tsx
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── email.ts                # Email sending functions
│   ├── magicWords.ts           # Authentication phrases
│   ├── streak.ts               # Streak calculation logic
│   └── utils.ts
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Seed script
│   └── migrations/
├── public/
│   └── lottie/                 # Lottie animation files
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Database Schema

### Coupon
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| title | String | Coupon title |
| description | String | What it entails |
| category | String | e.g. "Date Night", "Breakfast" |
| is_redeemed | Boolean | Whether it's been used |
| redemptionLimit | Int | Max number of redemptions (default: 1) |
| created_at | DateTime | Auto-set on creation |

### Redemption
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| coupon_id | String (FK) | References Coupon |
| note | String? | Optional memory note |
| redeemed_at | DateTime | Auto-set on redemption |

### Category
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| name | String | Unique category name |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g. [Supabase](https://supabase.com) free tier)
- A Brevo (or any SMTP) account for email

### 1. Clone and install

```bash
git clone <your-repo-url>
cd love-coupons
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in all values in `.env` — see the [Environment Variables](#environment-variables) section below.

### 3. Set up the database

```bash
npx prisma migrate deploy
npx prisma db seed      # optional: seed with starter coupons
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Database (PostgreSQL — Supabase recommended)
DATABASE_URL=           # Connection string (with connection pooler)
DIRECT_URL=             # Direct connection string (bypasses pooler, required for migrations)

# Email — SMTP credentials (Brevo recommended)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=              # Your Brevo login email or SMTP username
SMTP_PASS=              # Your Brevo SMTP key/password
SMTP_FROM=              # Sender address shown in emails (e.g. love@yourdomain.com)
SMTP_TO=                # Recipient address for redemption notifications

# Auth
ADMIN_PASSWORD=         # Password to access the /manage admin panel
USER_EMAIL=             # Email address that receives the magic word for app access

# Runtime
NODE_ENV=development    # Set to "production" in deployed environments
```

---

## Authentication

The app uses two independent access layers:

### Magic Word (App Access)
1. The visitor clicks "Send Magic Word" on the SecurityModal
2. A secret phrase is emailed to `USER_EMAIL`
3. The visitor types the phrase to unlock the app
4. An `auth_token` httpOnly cookie is set (valid for 24 hours)

### Admin Access (`/manage`)
- Protected by a simple password check against `ADMIN_PASSWORD`
- Session stored in an httpOnly cookie (valid for 24 hours)

---

## Running with Docker

```bash
# Build and start
docker-compose up --build

# Or build the image manually
docker build -t love-coupons .
docker run -p 3000:3000 --env-file .env love-coupons
```

The app runs on port `3000`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run verify-email` | Test SMTP connection and send a test email |
| `npx prisma studio` | Open Prisma visual database browser |
| `npx prisma db seed` | Seed the database with starter coupons |

---

## Streak System

The streak is calculated from the `Redemption` table:

- A streak increments when a coupon is redeemed on consecutive days
- Missing a day breaks the streak
- Milestones: **3, 7, 14, and 30 days**
- Each milestone triggers a celebration modal with a custom message
- Breaking a streak shows an encouraging message and resets the count
