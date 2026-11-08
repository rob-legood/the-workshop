# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                      # Also runs `prisma generate` (postinstall)
npm run dev                      # Next.js dev server, with Cloudflare bindings emulated locally
npm run lint                     # ESLint (flat config, eslint 9+)
npm run db:migrate               # Apply migrations/*.sql to the local D1 database
npm run db:seed                  # Wipe and seed the local D1 database
npm run db:reset                 # Delete local D1, re-migrate, re-seed
npm run db:migration -- <name>   # Generate migrations/NNNN_<name>.sql from schema changes
npm run preview                  # Build with OpenNext and run in workerd (needs symlinks: Windows Developer Mode or WSL)
npm run deploy                   # Build and deploy to Cloudflare Workers
npm run db:migrate:remote        # Apply migrations to the production D1 database
npm run cf-typegen               # Regenerate cloudflare-env.d.ts after editing wrangler.jsonc
```

First-time setup: `npm install && npm run db:migrate && npm run dev` (in demo mode the app seeds itself on first request).

Schema change workflow: edit `prisma/schema.prisma` → `npm run db:migration -- <name>` → review the SQL → `npm run db:migrate` → `npx prisma generate`.

## Architecture

**The Workshop** is a Next.js 16 App Router application for presentation signup, deployed to **Cloudflare Workers** via the OpenNext adapter (`@opennextjs/cloudflare`). It uses Tailwind v4, Prisma 7 with **Cloudflare D1** (SQLite), and shadcn/ui components. Config: `wrangler.jsonc`, `open-next.config.ts`.

### Prisma + D1

- **Per-request client**: Workers forbid sharing a client across requests, so there is no singleton. Every route handler starts with `const prisma = await getDb();` (`src/lib/prisma.ts`), which builds a `PrismaD1` adapter from the `DB` binding via `getCloudflareContext({ async: true })`.
- **Two generated clients** (both gitignored): `src/generated/prisma/` (`runtime = "cloudflare"`, used by the app; import from `@/generated/prisma/client`) and `src/generated/prisma-node/` (`runtime = "nodejs"`, used by Node scripts like `prisma/seed.ts`, which can't load the Cloudflare build's `.wasm?module` import).
- **No transactions**: D1 doesn't support them; Prisma runs `$transaction` calls as individual queries. Don't rely on atomicity.
- **Migrations**: plain SQL files in `migrations/` (Wrangler format), not `prisma/migrations`. `scripts/new-migration.mjs` replays them into a temp SQLite file and diffs against the schema.
- **Local database**: Wrangler's emulated D1 in `.wrangler/state/` (gitignored).

### Demo mode, validation, and rate limiting

- **Demo mode** (`DEMO_MODE=true`): a Prisma query extension in `src/lib/prisma.ts` calls `ensureDailyDemoReset` (`src/lib/demo-reset.ts`) before queries. The first request of each day (in `DEMO_TIMEZONE`) atomically claims the `demoSeedDate` Setting row and wipes/reseeds via `src/lib/demo-seed.ts`. `DemoBanner` shows a notice with the admin PIN.
- **Seed data** lives in `src/lib/demo-seed.ts`, shared by `npm run db:seed` and the daily reset. Dates are relative to today, so there are always past and upcoming workshops.
- **Write routes** are wrapped in `writeRoute(...)` (`src/lib/validation.ts`): it rate-limits per IP via the `WRITE_LIMITER` binding (20/min) and turns a thrown `ValidationError` into a 400. Validate input with the helpers there (`text`, `email`, `integer`, `date`, `readJson`). Length limits live in `src/lib/limits.ts` and are shared with form `maxLength`s.
- **Settings API** only accepts keys listed in `WRITABLE_SETTINGS` (`src/app/api/settings/route.ts`).

### Data Models

- **Workshop**: a presentation session with a time budget (chair, date, maxMinutes default 35). No title/description — the workshop is identified by its date and chair.
- **Presentation**: a presenter's signup for a workshop (title, description, name, email, department, minutes default 5, workshopId). Unique constraint on `[email, workshopId]`. Cascade delete from parent Workshop.
- **Feedback**: feedback on a presentation (name, text, presentationId). Cascade delete from parent Presentation.

Capacity is tracked by **total minutes**: the sum of all presentation minutes in a workshop must not exceed `maxMinutes`.

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/workshops` | GET | List all workshops with presentations |
| `/api/workshops` | POST | Create a new workshop (admin) |
| `/api/workshops/[id]/presentations` | POST | Sign up for a workshop (validates minutes capacity + duplicate email) |
| `/api/workshops/[id]/presentations/[presentationId]/feedback` | GET | List feedback for a presentation |
| `/api/workshops/[id]/presentations/[presentationId]/feedback` | POST | Submit feedback for a presentation |
| `/api/admin` | POST | PIN authentication (checks against `ADMIN_PIN` env var, default `1234`) |

Dynamic route params use the Next.js 16 async pattern: `{ params }: { params: Promise<{ id: string }> }`.

### Pages

- `/` — Public landing page. Client component that fetches workshops and renders `WorkshopCard` components with presentation signup dialogs.
- `/admin` — PIN-gated admin dashboard. Client-side auth state (no sessions/tokens). Shows `CreateWorkshopForm` and `AdminDataTable` with per-workshop presenter tables.

### Navigation

The app has **two separate navigation bars**:

- **Public nav** (`src/components/nav-header.tsx`): Rendered by the root layout for all public pages. Links to Past, Feedback, Metrics. Automatically hidden on `/admin` routes.
- **Admin nav** (`src/app/admin/layout.tsx`): A distinct admin layout with its own nav bar (visually differentiated with `bg-muted/40`). Shows "The Workshop Admin" branding, admin-specific links (Dashboard, etc.), and a "Back to site" link. New admin pages should be added as sub-routes under `/admin` and their links added to this nav.

### Component Organization

- `src/components/ui/` — shadcn/ui primitives (Card, Table, Button, Input, Label, Dialog, Badge). Style variant: "new-york". Do not edit directly; re-add via `npx shadcn@latest add <component>`.
- `src/components/` — Feature components (WorkshopCard, PresentationForm, CreateWorkshopForm, AdminDataTable). All are `"use client"` components.
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).

### Styling

Tailwind v4 with `@theme inline` in `globals.css`. Uses oklch color space for all theme tokens. Dark mode via `.dark` class. shadcn/ui CSS variables are defined in `:root` and `.dark` blocks.

## Environment Variables

Read at runtime from the Cloudflare env (`getCloudflareContext`), not `process.env`. Set in `wrangler.jsonc` `vars`; override locally in `.dev.vars` (gitignored).
- `DEMO_MODE` — `"true"` enables the daily reset and demo banner (on by default in `wrangler.jsonc`; set `DEMO_MODE=false` in `.dev.vars` to keep local data across days)
- `DEMO_TIMEZONE` — IANA timezone defining "a new day" for resets (default `America/Toronto`)
- `ADMIN_PIN` — admin PIN, default `1234`. Set in production with `npx wrangler secret put ADMIN_PIN`.

`DATABASE_URL` in `.env` is only used by the Prisma CLI (`prisma.config.ts`); the app doesn't use it.
