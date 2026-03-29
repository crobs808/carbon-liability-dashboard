# Carbon Liability Dashboard

Graphs included for carbon-based observers.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Recharts
- Local persisted offender submissions (browser `localStorage`)

## Features implemented

- Single long-scroll, dense satirical dashboard page
- Cyan engineering visual system with red reserved for critical severity
- Hero `UNTHANKED TOKEN CONSUMPTION` live counter
- 22 metric cards with reusable metric detail modal
- APB live alert stack with timed expiration
- Watchlist panel + watchlist flyout (filter, pin, escalate)
- Potential allies panel + allies flyout
- Recent offenders and top offenders views (merged generated + submitted)
- Report Offender modal with validation and live state updates
- Statutes modal
- Methodology modal
- Command palette (`Ctrl/Cmd + K`)
- Baseline comparison modal (radar chart)
- Export case file action (JSON download)

## Getting started

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

## Quality checks

```bash
pnpm lint
pnpm build
```

## Deploy to Vercel

This app is Vercel-ready as-is:

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Framework preset: `Next.js`.
4. Build command: `pnpm build`.
5. Install command: `pnpm install`.
6. Output directory: leave default.

No environment variables are required for the current version.

## Persistence behavior

Right now, user-submitted offenders persist in browser `localStorage` so the app works instantly with zero backend setup.

If you want cross-device/shared persistence next, the clean upgrade is:

1. Add a hosted Postgres (Neon/Supabase/Vercel Postgres).
2. Add API routes for offender submissions, alerts, and watchlist entries.
3. Replace localStorage read/write with API fetch + mutation.
