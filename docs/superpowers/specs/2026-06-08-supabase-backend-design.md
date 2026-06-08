# Supabase backend — design spec (Approach B, hybrid)

**Date:** 2026-06-08
**Status:** Approved (ready for implementation plan)
**Scope:** Add a persistent, multi-user backend to the Dink pickleball app using Supabase.

---

## 1. Goal

Move per-user data off `localStorage` into Supabase so a user's data is durable and
follows them across devices, with multi-user accounts. Each user has their **own private**
match history, roster, and settings.

## 2. Confirmed decisions

| Decision | Choice |
|---|---|
| Backend | Supabase (single project, this app only) |
| Auth model | **Multi-user with accounts** |
| Login gating | **Required but frictionless** — silent anonymous sign-in on load |
| Identity upgrade | **Magic link (email OTP) + Google OAuth** |
| Synced data | **Match history, roster, settings** (per-user) |
| Local-only | **Live in-progress match** (`useMatchStore`) stays local |
| Existing local data | **Fresh start** — no migration of current `localStorage` |
| Player model | **Personal scorekeeper log** — players are names; history = matches *you* recorded; no friend/shared-game system |
| Data-layer wiring | **Approach B (hybrid)** — react-query for lists, Zustand for settings |
| Link collision (existing email) | **v1: sign into existing account; anon data orphaned** (no merge) |
| Offline first-visit | **v1: requires network** (retry screen); returning users use cached session |

## 3. Architecture (Approach B — hybrid)

Each data type uses the access pattern that fits it:

- **History + roster** → `@supabase/supabase-js` calls wrapped in `@tanstack/react-query`
  hooks (list data; natural loading/error/empty states; lifts the current 50-match cap via
  pagination). The existing react-query provider (currently mounted but unused) becomes the
  read/write layer. **`useHistoryStore` is retired.**
- **Settings** → keep `useSettingsStore` (Zustand) as the **synchronous** source of truth +
  `localStorage` cache so theming (CSS vars) paints instantly with no flash. Swap its backend:
  pull the user's settings row on auth-ready (hydrate the store), and **write-through**
  (debounced upsert) to Supabase on every change. Last-write-wins.
- **Live match** → `useMatchStore` (live state + snapshot undo) is **untouched and local**.
  On match complete it calls the `useAddMatch` mutation (instead of `useHistoryStore.addMatch`);
  on match start it calls `useRememberPlayers`.
- **Scoring engine** (`scoringEngine.ts` / `courtView.ts`) is **untouched** — stays pure.

The old CLAUDE.md note ("add `src/Services/` with **ky** clients") is superseded: Supabase
ships its own client that handles session persistence, token refresh, anonymous auth, OAuth
linking, and magic-link callbacks. We use `@supabase/supabase-js`, not `ky`/PostgREST-by-hand.
CLAUDE.md will be updated to reflect this.

## 4. Database schema

Three tables, all per-user, RLS enabled.

```sql
-- matches: one row per finished match (owned by the recorder)
create table public.matches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  mode        text not null check (mode in ('singles','doubles')),
  names       jsonb not null,            -- Pair | DoublesNames
  score       jsonb not null,            -- [number, number]
  winner      smallint not null check (winner in (0,1)),
  target      smallint not null,
  duration_ms integer not null,
  played_at   timestamptz not null,      -- maps to MatchRecord.date
  created_at  timestamptz not null default now()
);
create index matches_user_played_idx on public.matches (user_id, played_at desc);

-- roster: personal autocomplete catalogue (kept as a table so names added at
-- match start, before any finished match, survive — matches today's rememberPlayers)
create table public.roster (
  user_id  uuid not null default auth.uid() references auth.users on delete cascade,
  name     text not null,
  n        integer not null default 0,
  last_at  timestamptz not null,
  primary key (user_id, name)
);

-- settings: one row per user; whole Settings object as jsonb (small, evolves freely)
create table public.settings (
  user_id    uuid primary key default auth.uid() references auth.users on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);
```

### RLS policies (own-rows-only, applied to all three)

```sql
alter table public.matches  enable row level security;
alter table public.roster   enable row level security;
alter table public.settings enable row level security;

create policy "own matches"  on public.matches  for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own roster"   on public.roster   for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own settings" on public.settings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Anonymous users have a real `auth.uid()`, so these policies cover them identically.
("Enable automatic RLS" at project creation is a belt-and-suspenders guard; we also enable
RLS explicitly above.)

## 5. Auth flow

- **Boot:** `getSession()`; if none → `signInAnonymously()`. `supabase-js` persists the session
  in `localStorage` and auto-refreshes. A small `AuthProvider` exposes `session`/`user`; the
  app renders a brief splash until the session is ready (required-auth, but invisible in the
  common case).
- **Upgrade ("Save your data", in Settings):**
  - Magic link: `signInWithOtp({ email, options: { emailRedirectTo } })`.
  - Google: `linkIdentity({ provider: 'google' })`.
  - Linking keeps the **same `user_id`**, so all existing data carries over with no migration.
- **Link-collision (v1):** if the email/Google identity already belongs to another account,
  Supabase errors; we show "already registered — signing you in" and sign into that account.
  The current device's anonymous data is left orphaned (no cross-account merge).
- **Redirects:** Supabase Auth needs Site URL + redirect URLs:
  `https://dink.hawkz-pl.workers.dev` (prod) and `http://localhost:5173` (dev).
  Client uses `detectSessionInUrl: true` to complete magic-link/OAuth callbacks.

## 6. Client data layer

```
src/Services/
  supabase.ts        - client singleton (env vars; persistSession/autoRefresh/detectSessionInUrl)
  auth.ts            - ensureSession(), linkEmail(), linkGoogle(), signOut()
  matches.ts         - listMatches(), addMatch() + pure mappers (rowToMatchRecord, recordToInsert)
  roster.ts          - listRoster(), rememberPlayers() + mapper
  settings.ts        - getSettings(), upsertSettings() + (de)serialize
src/Hooks/
  useMatches.ts      - react-query: useMatches (query, paginated), useAddMatch (mutation, optimistic+invalidate)
  useRoster.ts       - react-query: useRoster, useRememberPlayers
  useAuth.ts         - AuthProvider context + useAuth()
  useSettingsSync.ts - hydrate useSettingsStore from Supabase on auth-ready; debounced write-through
```

- **History screen / Setup autocomplete / Complete screen** consume the hooks (loading / empty /
  error states added where they read data).
- **Settings** keeps the Zustand store API unchanged for callers; `useSettingsSync` handles
  pull-on-auth + debounced push. If no settings row exists yet, insert the current store
  defaults.
- **Pure mappers** are isolated and unit-testable; the Supabase-touching functions stay thin.

## 7. Config & secrets

- Add dependency: `@supabase/supabase-js`.
- `.env.local` (gitignored): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- **Cloudflare Workers Build:** add the same two as **build variables** under the project's
  "Variables and secrets" (currently None). Vite inlines `import.meta.env.VITE_*` at
  `npm run build` time. The anon key is public by design; **RLS** is what protects data.
- `.env.example` committed to document the required vars.

## 8. Error handling

- Reads/writes surface errors via react-query states (inline message / lightweight toast).
- First-ever visit while offline can't create an anon session → friendly retry screen
  ("connect to get started"). Returning users have a cached session and degrade gracefully.
- RLS guarantees per-user isolation server-side regardless of any client bug.

## 9. Testing

- **New pure mappers** get vitest unit tests (row ↔ `MatchRecord`; settings serialize/parse).
- `scoringEngine.test.ts` stays green (engine untouched).
- Supabase client kept thin; hook/integration tests mock it (jsdom can't hit a real DB).
- **Manual verification checklist:** anon session created on first load → add match writes a
  row (visible in Supabase) → history reads it back → roster autocomplete works → settings
  persist across reload **and** a second browser → magic-link + Google upgrade keeps data →
  RLS confirmed (a second account cannot see the first's rows).

## 10. Manual Supabase setup (done in dashboard; exact values provided during impl)

1. Create project (Data API ON, auto-expose ON, automatic RLS ON).
2. Auth → enable **Anonymous sign-ins**; keep **Email** provider on (magic link).
3. Configure **Google** provider (Google Cloud OAuth client → client id/secret into Supabase).
4. Set **Site URL + redirect URLs** (prod Worker URL + `localhost:5173`).
5. Run the **schema + RLS SQL** (section 4) in the SQL editor.
6. Copy **Project URL + anon key** → `.env.local` and Cloudflare build vars.

## 11. v1 limitations (accepted)

- No cross-account merge on email/Google link collision (anon data orphaned).
- First-ever visit requires network (no offline-first / sync queue).
- Personal log only — no shared/joined games, no friend system.
- Settings conflict resolution is last-write-wins (fine for a single user's devices).

## 12. Out of scope (possible future, additive)

- Shared/social history (`profiles` + `match_participants` + shared-visibility RLS + friend flow).
- Offline-first with a write/sync queue.
- Cross-account data merge.
- Supabase↔GitHub schema-in-code integration.

## 13. File-level change summary

- **Add:** `src/Services/{supabase,auth,matches,roster,settings}.ts`,
  `src/Hooks/{useMatches,useRoster,useAuth,useSettingsSync}.ts`,
  `src/Services/*.test.ts` (mappers), `.env.example`, schema SQL (e.g. `supabase/schema.sql`).
- **Modify:** `useSettingsStore` (back with Supabase via sync hook), `DinkApp` (AuthProvider +
  splash/retry gate + settings sync), History/Setup/Complete screens (use hooks),
  match-complete + match-start wiring, `CLAUDE.md` (data-layer note), `package.json` (dep).
- **Retire:** `useHistoryStore` (replaced by react-query hooks).
- **Untouched:** scoring engine, `courtView`, `useMatchStore`, skins/theme token system.
```
