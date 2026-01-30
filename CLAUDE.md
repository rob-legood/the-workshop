# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint (flat config, eslint 9+)
npm run db:migrate   # Run Prisma migrations (prisma migrate dev)
npm run db:seed      # Seed database with sample data (npx tsx prisma/seed.ts)
npm run db:reset     # Reset database and re-apply migrations
```

After changing `prisma/schema.prisma`, run `npm run db:migrate` to generate a migration and regenerate the Prisma client.

## Architecture

**The Workshop** is a Next.js 16 App Router application for internal presentation signup. It uses Tailwind v4, Prisma 7 with SQLite, and shadcn/ui components.

### Prisma + SQLite (better-sqlite3 adapter)

Prisma 7 uses the `prisma-client` generator which requires a driver adapter. The app uses `@prisma/adapter-better-sqlite3`:

- **Singleton**: `src/lib/prisma.ts` — creates a `PrismaBetterSqlite3` adapter with `url: "file:dev.db"` and passes it to `PrismaClient({ adapter })`. Uses global caching for HMR.
- **Generated client**: output at `src/generated/prisma/` (gitignored). Import from `@/generated/prisma/client`.
- **Seed script**: `prisma/seed.ts` — must also construct its own adapter (can't use the `@/` alias). Imports from `../src/generated/prisma/client.js`.
- **Database file**: `dev.db` lives at the project root (not inside `prisma/`), despite `DATABASE_URL=file:./dev.db` — Prisma CLI resolves that path relative to the schema directory.

### Data Models

- **Workshop**: a presentation session with a time budget (chair, date, maxMinutes default 35). No title/description — the workshop is identified by its date and chair.
- **Presentation**: a presenter's signup for a workshop (title, description, name, email, department, minutes default 5, workshopId). Unique constraint on `[email, workshopId]`. Cascade delete from parent Workshop.

Capacity is tracked by **total minutes**: the sum of all presentation minutes in a workshop must not exceed `maxMinutes`.

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/workshops` | GET | List all workshops with presentations |
| `/api/workshops` | POST | Create a new workshop (admin) |
| `/api/workshops/[id]/presentations` | POST | Sign up for a workshop (validates minutes capacity + duplicate email) |
| `/api/admin` | POST | PIN authentication (checks against `ADMIN_PIN` env var, default `1234`) |

Dynamic route params use the Next.js 16 async pattern: `{ params }: { params: Promise<{ id: string }> }`.

### Pages

- `/` — Public landing page. Client component that fetches workshops and renders `WorkshopCard` components with presentation signup dialogs.
- `/admin` — PIN-gated admin dashboard. Client-side auth state (no sessions/tokens). Shows `CreateWorkshopForm` and `AdminDataTable` with per-workshop presenter tables.

### Component Organization

- `src/components/ui/` — shadcn/ui primitives (Card, Table, Button, Input, Label, Dialog, Badge). Style variant: "new-york". Do not edit directly; re-add via `npx shadcn@latest add <component>`.
- `src/components/` — Feature components (WorkshopCard, PresentationForm, CreateWorkshopForm, AdminDataTable). All are `"use client"` components.
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).

### Styling

Tailwind v4 with `@theme inline` in `globals.css`. Uses oklch color space for all theme tokens. Dark mode via `.dark` class. shadcn/ui CSS variables are defined in `:root` and `.dark` blocks.

## Environment Variables

Defined in `.env` (gitignored):
- `DATABASE_URL` — SQLite connection string for Prisma CLI migrations
- `ADMIN_PIN` — PIN for admin dashboard access
