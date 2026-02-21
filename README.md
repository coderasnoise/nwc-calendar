# Medical Calendar MVP

Single-doctor scheduling MVP built with Next.js + Supabase.

## Stack
- Next.js App Router + TypeScript + Tailwind CSS
- Supabase Auth + Postgres + Storage
- FullCalendar
- Zod

## Local Development
1. Install dependencies:
```bash
npm install
```
2. Create local env:
```bash
cp .env.example .env.local
```
3. Fill `.env.local` values.
4. Apply Supabase SQL migrations in order:
- `supabase/migrations/0001_init.sql`
- `supabase/migrations/0002_rls_policies.sql`
- `supabase/migrations/0003_storage.sql`
5. Start the app:
```bash
npm run dev
```

## Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional in app runtime, useful for admin scripts)

## Main Routes
- `/login`
- `/dashboard`
- `/patients`
- `/calendar`
- `/timeline`
- `/audit`
- `/import`

## Auth Protection
- Middleware enforces authentication on `/dashboard`, `/patients`, `/calendar`, `/timeline`, and `/audit`.
- Unauthenticated requests to protected routes are redirected to `/login`.

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run format`
- `npm run typecheck`
- `npm run test`

## Deployment Guide (Vercel + Supabase)
1. Push repository to GitHub.
2. Create a Vercel project from the repo.
3. Add environment variables in Vercel Project Settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (only if needed by future server/admin features)
4. In Supabase, set Authentication URL settings:
- Site URL = your Vercel production URL
- Add Vercel preview domains to redirect URLs if needed
5. Deploy on Vercel.
6. Verify login flow and protected routes.

## Notes
- Postgres is the source of truth.
- Audit logs are recorded via DB triggers for patient insert/update/delete.
- `.ics` imports: use `/import` to preview and import Google Calendar exports into `patients` using `surgery_date`.
- Optional performance migration for import dedupe:
  - `supabase/migrations/0004_import_indexes.sql`
