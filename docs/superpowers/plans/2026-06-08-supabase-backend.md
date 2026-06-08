# Supabase Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the app's `localStorage`-backed history/roster/settings with a per-user Supabase backend (multi-user, anonymous-first auth, RLS-isolated), so each user's data is durable and follows them across devices.

**Architecture:** Approach B hybrid — match history + roster move to `@supabase/supabase-js` calls wrapped in `@tanstack/react-query` hooks (the already-mounted provider becomes the read/write layer; `useHistoryStore` is retired). Settings stay in `useSettingsStore` (Zustand + `localStorage` cache so theming paints instantly) but are hydrated from Supabase on auth-ready and write-through (debounced upsert) on change. Auth is silent `signInAnonymously()` on boot with optional magic-link / Google upgrade in Settings; row ownership is enforced server-side by RLS keyed on `auth.uid()`.

**Tech Stack:** React 19, TypeScript, Vite 7, @supabase/supabase-js, @tanstack/react-query, Zustand, Vitest

---

## File Structure

### Create

| File | Responsibility |
|---|---|
| `.env.example` | Documents required build-time env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). |
| `supabase/schema.sql` | Committed DB schema + RLS policies (spec §4); run by hand in the Supabase SQL editor. |
| `src/Services/supabase.ts` | The `@supabase/supabase-js` client singleton (reads env, `persistSession`/`autoRefreshToken`/`detectSessionInUrl`). |
| `src/Services/auth.ts` | `ensureSession()`, `linkEmail()`, `linkGoogle()`, `signOut()` — thin auth wrappers. |
| `src/Services/matches.ts` | `listMatches()`, `addMatch()` + pure mappers `rowToMatchRecord` / `recordToInsert`; `MatchRow` type. |
| `src/Services/matches.test.ts` | Unit tests for the pure match mappers. |
| `src/Services/roster.ts` | `listRoster()`, `rememberPlayers()` + pure mapper `rowToRosterEntry`; `RosterRow` type. |
| `src/Services/roster.test.ts` | Unit tests for the pure roster mapper. |
| `src/Services/settings.ts` | `getSettings()`, `upsertSettings()` + pure `serializeSettings` / `parseSettings`. |
| `src/Services/settings.test.ts` | Unit tests for the settings serialize/parse round-trip. |
| `src/Hooks/useAuth.tsx` | `AuthProvider` context + `useAuth()` (boots `ensureSession`, exposes `session`/`status`/`retry`). |
| `src/Hooks/useMatches.ts` | react-query `useMatches()` (query) + `useAddMatch()` (mutation, invalidate). |
| `src/Hooks/useRoster.ts` | react-query `useRoster()` (query) + `useRememberPlayers()` (mutation, invalidate). |
| `src/Hooks/useSettingsSync.ts` | Pulls settings row into `useSettingsStore` on auth-ready; debounced write-through on change. |

### Modify

| File | Change |
|---|---|
| `package.json` | Add `@supabase/supabase-js` dependency. |
| `src/main.tsx` | Wrap `<App/>` in `<AuthProvider>`. |
| `src/Components/Dink/DinkApp.tsx` | Auth/splash/retry gate, settings sync, swap `useHistoryStore` reads/writes for hooks (`useMatches`, `useAddMatch`, `useRememberPlayers`); wire match-complete + match-start. |
| `src/Components/Dink/Autocomplete.tsx` | Read roster from `useRoster()` instead of `useHistoryStore`. |
| `src/Components/Dink/Screens/History.tsx` | Accept loading/error states (props) and render them. |
| `src/Components/Dink/Screens/Settings.tsx` | Add an "Account" section: magic-link + Google upgrade + sign-out. |
| `CLAUDE.md` | Update the data-layer note (ky → `@supabase/supabase-js`) + structure/store list. |
| `tasks/todo.md` | Add the Supabase initiative checklist + review. |

### Retire

| File | Reason |
|---|---|
| `src/Stores/useHistoryStore.ts` | Replaced by react-query hooks (`useMatches`/`useAddMatch`/`useRoster`/`useRememberPlayers`). Deleted in the last code task once no imports remain. |

### Untouched (do not edit)

`src/Utils/scoringEngine.ts`, `src/Utils/courtView.ts`, `src/Utils/roster.ts` (the pure `foldRoster`/`rosterSuggestions` helpers are reused), `src/Stores/useMatchStore.ts` internals, `src/Components/Dink/skins.ts`, `src/Components/Dink/theme.ts`, all scoreboard/animation modules.

---

### Task 1: Add the Supabase dependency and `.env.example`

**Files:**
- Modify: `package.json` (dependencies block, lines 16-23)
- Create: `.env.example`

- [ ] Install the client (this also updates `package.json` + lockfile):
  ```bash
  npm install @supabase/supabase-js
  ```
  Expected: `package.json` `dependencies` now lists `"@supabase/supabase-js"` and install completes with no errors.
- [ ] Confirm the dependency landed:
  ```bash
  npm ls @supabase/supabase-js
  ```
  Expected: prints `@supabase/supabase-js@2.x.x` (a resolved version, not `(empty)`).
- [ ] Create `.env.example` documenting the required vars (no secrets — placeholders only):
  ```bash
  # Supabase — set real values in .env.local (gitignored) for local dev,
  # and as Cloudflare Workers Build variables for production.
  # The anon key is public by design; RLS is what protects data.
  VITE_SUPABASE_URL=https://your-project-ref.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-public-key
  ```
  Write this content to `.env.example`.
- [ ] Verify `.env.local` is already gitignored (it is — `.gitignore` lists `.env.local`); no change needed. Confirm:
  ```bash
  git check-ignore .env.local
  ```
  Expected: prints `.env.local`.
- [ ] Commit:
  ```bash
  git add package.json package-lock.json .env.example
  git commit -m "chore(deps): add @supabase/supabase-js + .env.example"
  ```

---

### Task 2: Commit the database schema + RLS SQL

**Files:**
- Create: `supabase/schema.sql`

- [ ] Create `supabase/schema.sql` with the exact schema and RLS from spec §4:
  ```sql
  -- Dink — Supabase schema + RLS. Run in the Supabase SQL editor.
  -- All tables are per-user and RLS-enforced on auth.uid().

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

  -- roster: personal autocomplete catalogue (names survive even before any
  -- finished match — matches today's rememberPlayers behaviour)
  create table public.roster (
    user_id  uuid not null default auth.uid() references auth.users on delete cascade,
    name     text not null,
    n        integer not null default 0,
    last_at  timestamptz not null,
    primary key (user_id, name)
  );

  -- settings: one row per user; whole Settings object as jsonb
  create table public.settings (
    user_id    uuid primary key default auth.uid() references auth.users on delete cascade,
    data       jsonb not null,
    updated_at timestamptz not null default now()
  );

  -- RLS: own-rows-only on all three tables
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
- [ ] Manual (not automatable here — note in the task, do NOT block): run this file in the Supabase SQL editor and complete the dashboard setup from spec §10 (anonymous sign-ins ON, Email provider ON, Google provider configured, Site URL + redirect URLs `https://dink.hawkz-pl.workers.dev` and `http://localhost:5173`). Copy the Project URL + anon key into `.env.local` and into Cloudflare Workers Build → "Variables and secrets".
- [ ] Commit:
  ```bash
  git add supabase/schema.sql
  git commit -m "feat(supabase): add committed schema + RLS SQL"
  ```

---

### Task 3: Supabase client singleton

**Files:**
- Create: `src/Services/supabase.ts`

- [ ] Create the client singleton. Vite inlines `import.meta.env.VITE_*` at build time; throw early if missing so misconfiguration is obvious:
  ```ts
  /* supabase.ts — the @supabase/supabase-js client singleton.
   * Env vars are inlined by Vite at build time (also set as Cloudflare build vars).
   * The anon key is public by design; RLS protects data server-side. */

  import { createClient } from '@supabase/supabase-js';

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
      throw new Error(
          'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
              'Set them in .env.local (dev) and Cloudflare build vars (prod).'
      );
  }

  export const supabase = createClient(url, anonKey, {
      auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
      },
  });
  ```
- [ ] Add the env var types so `import.meta.env` is typed. Read `src/vite-env.d.ts` first if it exists; otherwise create it. Then ensure it contains:
  ```ts
  /// <reference types="vite/client" />

  interface ImportMetaEnv {
      readonly VITE_SUPABASE_URL: string;
      readonly VITE_SUPABASE_ANON_KEY: string;
  }
  interface ImportMeta {
      readonly env: ImportMetaEnv;
  }
  ```
  (If `src/vite-env.d.ts` already exists with the `vite/client` reference, only add the `ImportMetaEnv` / `ImportMeta` interfaces — do not duplicate the reference line.)
- [ ] Typecheck (no test yet — this is a thin env-bound wrapper, manually verified):
  ```bash
  npm run typecheck
  ```
  Expected: PASS (0 errors).
- [ ] Commit:
  ```bash
  git add src/Services/supabase.ts src/vite-env.d.ts
  git commit -m "feat(supabase): add client singleton + env types"
  ```

---

### Task 4: Auth service wrappers

**Files:**
- Create: `src/Services/auth.ts`

- [ ] Create thin auth wrappers around the client. These call the network and are manually verified (not unit-tested — jsdom can't reach Supabase):
  ```ts
  /* auth.ts — thin wrappers over supabase.auth. Anonymous-first; optional
   * magic-link / Google upgrade. Linking keeps the same user_id, so data carries
   * over with no migration. */

  import type { Session } from '@supabase/supabase-js';

  import { supabase } from './supabase';

  /** Return an existing session, or silently create an anonymous one. */
  export async function ensureSession(): Promise<Session> {
      const { data } = await supabase.auth.getSession();
      if (data.session) return data.session;

      const { data: anon, error } = await supabase.auth.signInAnonymously();
      if (error || !anon.session) {
          throw error ?? new Error('Could not start a session');
      }

      return anon.session;
  }

  /** Send a magic link to upgrade the current (anonymous) account. */
  export async function linkEmail(email: string): Promise<void> {
      const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
  }

  /** Start the Google OAuth link flow for the current account. */
  export async function linkGoogle(): Promise<void> {
      const { error } = await supabase.auth.linkIdentity({
          provider: 'google',
          options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
  }

  export async function signOut(): Promise<void> {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
  }
  ```
- [ ] Typecheck:
  ```bash
  npm run typecheck
  ```
  Expected: PASS (0 errors).
- [ ] Commit:
  ```bash
  git add src/Services/auth.ts
  git commit -m "feat(supabase): add auth service (ensureSession/linkEmail/linkGoogle/signOut)"
  ```

---

### Task 5: Match mappers (TDD) + service

**Files:**
- Create: `src/Services/matches.test.ts`
- Create: `src/Services/matches.ts`

- [ ] Write the failing mapper test first. The pure mappers convert between a DB row and `MatchRecord` (note: row `played_at` is an ISO string ↔ `MatchRecord.date` is epoch ms; `recordToInsert` drops `id`/`date` and supplies `played_at`):
  ```ts
  import { describe, expect, it } from 'vitest';

  import type { DoublesNames, MatchRecord, Pair } from '../Types/Game';
  import type { MatchRow } from './matches';
  import { recordToInsert, rowToMatchRecord } from './matches';

  const row: MatchRow = {
      id: 'abc',
      user_id: 'u1',
      mode: 'singles',
      names: ['You', 'Riley'] as Pair,
      score: [11, 7],
      winner: 0,
      target: 11,
      duration_ms: 600000,
      played_at: '2026-06-08T10:00:00.000Z',
      created_at: '2026-06-08T10:00:00.000Z',
  };

  describe('rowToMatchRecord', () => {
      it('maps a singles row to a MatchRecord (played_at → epoch ms)', () => {
          const rec = rowToMatchRecord(row);
          expect(rec).toEqual({
              id: 'abc',
              mode: 'singles',
              names: ['You', 'Riley'],
              score: [11, 7],
              winner: 0,
              target: 11,
              durationMs: 600000,
              date: Date.parse('2026-06-08T10:00:00.000Z'),
          });
      });

      it('preserves doubles names structure', () => {
          const dbl: MatchRow = {
              ...row,
              mode: 'doubles',
              names: [
                  ['You', 'Sam'],
                  ['Theo', 'Mara'],
              ] as DoublesNames,
              winner: 1,
          };
          const rec = rowToMatchRecord(dbl);
          expect(rec.mode).toBe('doubles');
          expect(rec.names).toEqual([
              ['You', 'Sam'],
              ['Theo', 'Mara'],
          ]);
          expect(rec.winner).toBe(1);
      });
  });

  describe('recordToInsert', () => {
      it('drops id/date, maps durationMs → duration_ms and date → played_at ISO', () => {
          const rec: MatchRecord = {
              id: 'local-123',
              mode: 'singles',
              names: ['You', 'Riley'] as Pair,
              score: [11, 7],
              winner: 0,
              target: 11,
              durationMs: 600000,
              date: Date.parse('2026-06-08T10:00:00.000Z'),
          };
          expect(recordToInsert(rec)).toEqual({
              mode: 'singles',
              names: ['You', 'Riley'],
              score: [11, 7],
              winner: 0,
              target: 11,
              duration_ms: 600000,
              played_at: '2026-06-08T10:00:00.000Z',
          });
      });
  });
  ```
- [ ] Run it — expect FAIL (module not found / no exports):
  ```bash
  npx vitest run src/Services/matches.test.ts
  ```
  Expected: FAIL — cannot resolve `./matches` (or `rowToMatchRecord is not a function`).
- [ ] Implement `src/Services/matches.ts` with the pure mappers and thin Supabase calls:
  ```ts
  /* matches.ts — match history persistence + pure row<->MatchRecord mappers. */

  import type { MatchNames, MatchRecord, Mode, Target, TeamIdx } from '../Types/Game';
  import { supabase } from './supabase';

  export interface MatchRow {
      id: string;
      user_id: string;
      mode: Mode;
      names: MatchNames;
      score: [number, number];
      winner: TeamIdx;
      target: Target;
      duration_ms: number;
      played_at: string;
      created_at: string;
  }

  export interface MatchInsert {
      mode: Mode;
      names: MatchNames;
      score: [number, number];
      winner: TeamIdx;
      target: Target;
      duration_ms: number;
      played_at: string;
  }

  /** Pure: DB row → MatchRecord (played_at ISO → epoch ms). */
  export function rowToMatchRecord(row: MatchRow): MatchRecord {
      return {
          id: row.id,
          mode: row.mode,
          names: row.names,
          score: row.score,
          winner: row.winner,
          target: row.target,
          durationMs: row.duration_ms,
          date: Date.parse(row.played_at),
      };
  }

  /** Pure: MatchRecord → insert payload (drops id/date; date → played_at ISO). */
  export function recordToInsert(rec: MatchRecord): MatchInsert {
      return {
          mode: rec.mode,
          names: rec.names,
          score: rec.score,
          winner: rec.winner,
          target: rec.target,
          duration_ms: rec.durationMs,
          played_at: new Date(rec.date).toISOString(),
      };
  }

  /** List the current user's matches, newest first. */
  export async function listMatches(): Promise<MatchRecord[]> {
      const { data, error } = await supabase
          .from('matches')
          .select('*')
          .order('played_at', { ascending: false });
      if (error) throw error;

      return (data as MatchRow[]).map(rowToMatchRecord);
  }

  /** Insert a finished match; returns the stored record. */
  export async function addMatch(rec: MatchRecord): Promise<MatchRecord> {
      const { data, error } = await supabase
          .from('matches')
          .insert(recordToInsert(rec))
          .select('*')
          .single();
      if (error) throw error;

      return rowToMatchRecord(data as MatchRow);
  }
  ```
- [ ] Run the test again — expect PASS:
  ```bash
  npx vitest run src/Services/matches.test.ts
  ```
  Expected: PASS (5 assertions across 3 tests green).
- [ ] Lint-fix (reorders imports) + typecheck:
  ```bash
  npm run lint:fix && npm run typecheck
  ```
  Expected: 0 errors.
- [ ] Commit:
  ```bash
  git add src/Services/matches.ts src/Services/matches.test.ts
  git commit -m "feat(supabase): matches service + pure row<->MatchRecord mappers (TDD)"
  ```

---

### Task 6: Roster mapper (TDD) + service

**Files:**
- Create: `src/Services/roster.test.ts`
- Create: `src/Services/roster.ts`

> Note: the existing pure helper file is `src/Utils/roster.ts` (`foldRoster`/`rosterSuggestions`). The new service is `src/Services/roster.ts` — distinct path. `rememberPlayers` reuses `foldRoster` to compute upserts.

- [ ] Write the failing mapper test first (row `last_at` ISO ↔ `RosterEntry.at` epoch ms):
  ```ts
  import { describe, expect, it } from 'vitest';

  import type { RosterRow } from './roster';
  import { rowToRosterEntry } from './roster';

  describe('rowToRosterEntry', () => {
      it('maps a roster row to a RosterEntry (last_at → epoch ms)', () => {
          const row: RosterRow = {
              user_id: 'u1',
              name: 'Riley',
              n: 3,
              last_at: '2026-06-08T10:00:00.000Z',
          };
          expect(rowToRosterEntry(row)).toEqual({
              name: 'Riley',
              n: 3,
              at: Date.parse('2026-06-08T10:00:00.000Z'),
          });
      });
  });
  ```
- [ ] Run it — expect FAIL:
  ```bash
  npx vitest run src/Services/roster.test.ts
  ```
  Expected: FAIL — cannot resolve `./roster` exports.
- [ ] Implement `src/Services/roster.ts`. `rememberPlayers` reads the current roster, folds the new names in (reusing the pure `foldRoster`), and upserts the affected rows:
  ```ts
  /* roster.ts — personal autocomplete catalogue persistence + pure mapper.
   * rememberPlayers reuses the pure foldRoster from Utils to compute updated rows. */

  import type { MatchNames, RosterEntry } from '../Types/Game';
  import { flattenNames, foldRoster } from '../Utils/roster';
  import { supabase } from './supabase';

  export interface RosterRow {
      user_id: string;
      name: string;
      n: number;
      last_at: string;
  }

  /** Pure: DB row → RosterEntry (last_at ISO → epoch ms). */
  export function rowToRosterEntry(row: RosterRow): RosterEntry {
      return { name: row.name, n: row.n, at: Date.parse(row.last_at) };
  }

  /** List the current user's roster, recency- then frequency-ranked. */
  export async function listRoster(): Promise<RosterEntry[]> {
      const { data, error } = await supabase
          .from('roster')
          .select('*')
          .order('last_at', { ascending: false });
      if (error) throw error;

      return (data as RosterRow[]).map(rowToRosterEntry);
  }

  /** Fold a set of names into the roster (frequency/recency) and upsert them. */
  export async function rememberPlayers(names: MatchNames): Promise<void> {
      const now = Date.now();
      const current = await listRoster();
      const folded = foldRoster(current, names, now);

      // Only the names that appear in this batch changed — upsert just those.
      const touched = new Set(
          flattenNames(names)
              .map((s) => s.trim().toLowerCase())
              .filter(Boolean)
      );
      const rows = folded
          .filter((e) => touched.has(e.name.toLowerCase()))
          .map((e) => ({
              name: e.name,
              n: e.n,
              last_at: new Date(e.at).toISOString(),
          }));
      if (!rows.length) return;

      const { error } = await supabase.from('roster').upsert(rows, { onConflict: 'user_id,name' });
      if (error) throw error;
  }
  ```
- [ ] Run the test again — expect PASS:
  ```bash
  npx vitest run src/Services/roster.test.ts
  ```
  Expected: PASS (1 test green).
- [ ] Lint-fix + typecheck:
  ```bash
  npm run lint:fix && npm run typecheck
  ```
  Expected: 0 errors.
- [ ] Commit:
  ```bash
  git add src/Services/roster.ts src/Services/roster.test.ts
  git commit -m "feat(supabase): roster service + pure row->RosterEntry mapper (TDD)"
  ```

---

### Task 7: Settings serialize/parse (TDD) + service

**Files:**
- Create: `src/Services/settings.test.ts`
- Create: `src/Services/settings.ts`

> `serializeSettings`/`parseSettings` are pure. `parseSettings` must tolerate a partial/legacy `data` blob by filling from `DEFAULTS` (forward-compatible since settings evolve freely). To avoid a circular import (`useSettingsStore` → sync hook → settings service), `DEFAULTS` is re-derived locally here as a typed constant matching the store; if `useSettingsStore` ever exports `DEFAULTS`, import it instead.

- [ ] Write the failing test first:
  ```ts
  import { describe, expect, it } from 'vitest';

  import type { Settings } from '../Stores/useSettingsStore';
  import { parseSettings, serializeSettings } from './settings';

  const full: Settings = {
      accent: 'clay',
      paperAccent: 'pine',
      courtStyle: 'glass',
      speed: 'snappy',
      target: 15,
      winByTwo: false,
      lastMode: 'doubles',
      singlesNames: ['A', 'B'],
      doublesNames: [
          ['A', 'B'],
          ['C', 'D'],
      ],
  };

  describe('serialize/parse settings', () => {
      it('round-trips a full Settings object', () => {
          expect(parseSettings(serializeSettings(full))).toEqual(full);
      });

      it('fills missing keys from defaults on a partial blob', () => {
          const parsed = parseSettings({ accent: 'grape', target: 21 });
          expect(parsed.accent).toBe('grape');
          expect(parsed.target).toBe(21);
          // unspecified keys fall back to defaults
          expect(parsed.courtStyle).toBe('court');
          expect(parsed.speed).toBe('default');
          expect(parsed.singlesNames).toEqual(['You', 'Riley']);
      });

      it('falls back to all defaults on null/garbage input', () => {
          expect(parseSettings(null).courtStyle).toBe('court');
          expect(parseSettings('nope' as unknown).accent).toBe('green');
      });
  });
  ```
- [ ] Run it — expect FAIL:
  ```bash
  npx vitest run src/Services/settings.test.ts
  ```
  Expected: FAIL — cannot resolve `./settings` exports.
- [ ] Implement `src/Services/settings.ts`:
  ```ts
  /* settings.ts — per-user settings persistence + pure (de)serialize.
   * parseSettings is forward-compatible: it fills missing keys from defaults so
   * an evolving Settings shape never breaks an older stored blob. */

  import type { Settings } from '../Stores/useSettingsStore';
  import { supabase } from './supabase';

  /** Defaults mirror useSettingsStore's DEFAULTS (kept here to avoid a cycle). */
  const SETTINGS_DEFAULTS: Settings = {
      accent: 'green',
      paperAccent: 'rust',
      courtStyle: 'court',
      speed: 'default',
      target: 11,
      winByTwo: true,
      lastMode: 'singles',
      singlesNames: ['You', 'Riley'],
      doublesNames: [
          ['You', 'Sam'],
          ['Theo', 'Mara'],
      ],
  };

  /** Pure: Settings → jsonb-safe payload (currently identity, isolated for evolution). */
  export function serializeSettings(s: Settings): Record<string, unknown> {
      return { ...s };
  }

  /** Pure: stored jsonb → Settings, filling any missing/garbage keys from defaults. */
  export function parseSettings(data: unknown): Settings {
      if (!data || typeof data !== 'object') return { ...SETTINGS_DEFAULTS };

      return { ...SETTINGS_DEFAULTS, ...(data as Partial<Settings>) };
  }

  /** Fetch the current user's settings row, or null if none exists yet. */
  export async function getSettings(): Promise<Settings | null> {
      const { data, error } = await supabase
          .from('settings')
          .select('data')
          .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      return parseSettings((data as { data: unknown }).data);
  }

  /** Upsert the current user's settings (last-write-wins). */
  export async function upsertSettings(s: Settings): Promise<void> {
      const { error } = await supabase
          .from('settings')
          .upsert(
              { data: serializeSettings(s), updated_at: new Date().toISOString() },
              { onConflict: 'user_id' }
          );
      if (error) throw error;
  }
  ```
- [ ] Run the test again — expect PASS:
  ```bash
  npx vitest run src/Services/settings.test.ts
  ```
  Expected: PASS (3 tests green).
- [ ] Lint-fix + typecheck:
  ```bash
  npm run lint:fix && npm run typecheck
  ```
  Expected: 0 errors.
- [ ] Commit:
  ```bash
  git add src/Services/settings.ts src/Services/settings.test.ts
  git commit -m "feat(supabase): settings service + pure serialize/parse (TDD)"
  ```

---

### Task 8: AuthProvider + `useAuth`

**Files:**
- Create: `src/Hooks/useAuth.tsx`

> Network-touching context; manually verified (no unit test — jsdom can't reach Supabase). Exposes `status: 'loading' | 'ready' | 'error'`, the `session`/`user`, and a `retry()` for the offline first-visit case (spec §8).

- [ ] Implement the provider + hook:
  ```tsx
  /* useAuth.tsx — boots a session (anonymous-first) and exposes it via context.
   * Renders nothing itself; consumers gate on `status`. */

  import type { Session, User } from '@supabase/supabase-js';
  import { createContext, useCallback, useContext, useEffect, useState } from 'react';

  import { ensureSession } from '../Services/auth';
  import { supabase } from '../Services/supabase';

  type AuthStatus = 'loading' | 'ready' | 'error';

  interface AuthValue {
      status: AuthStatus;
      session: Session | null;
      user: User | null;
      retry: () => void;
  }

  const AuthContext = createContext<AuthValue | null>(null);

  export function AuthProvider({ children }: { children: React.ReactNode }) {
      const [status, setStatus] = useState<AuthStatus>('loading');
      const [session, setSession] = useState<Session | null>(null);
      const [attempt, setAttempt] = useState(0);

      const retry = useCallback(() => {
          setStatus('loading');
          setAttempt((a) => a + 1);
      }, []);

      useEffect(() => {
          let active = true;
          ensureSession()
              .then((s) => {
                  if (!active) return;
                  setSession(s);
                  setStatus('ready');
              })
              .catch(() => {
                  if (!active) return;
                  setStatus('error');
              });

          return () => {
              active = false;
          };
      }, [attempt]);

      // Keep the session fresh across token refreshes / link upgrades.
      useEffect(() => {
          const { data } = supabase.auth.onAuthStateChange((_event, s) => {
              setSession(s);
          });

          return () => data.subscription.unsubscribe();
      }, []);

      const value: AuthValue = {
          status,
          session,
          user: session?.user ?? null,
          retry,
      };

      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }

  export function useAuth(): AuthValue {
      const ctx = useContext(AuthContext);
      if (!ctx) throw new Error('useAuth must be used within AuthProvider');

      return ctx;
  }
  ```
- [ ] Typecheck:
  ```bash
  npm run typecheck
  ```
  Expected: PASS (0 errors).
- [ ] Commit:
  ```bash
  git add src/Hooks/useAuth.tsx
  git commit -m "feat(supabase): AuthProvider + useAuth (anonymous-first session boot)"
  ```

---

### Task 9: Mount `AuthProvider` in `main.tsx`

**Files:**
- Modify: `src/main.tsx` (imports + the provider tree, lines 1-27)

> The `QueryClientProvider` already exists. `AuthProvider` wraps inside it so hooks can use both.

- [ ] Add the import (lint:fix will sort it):
  ```ts
  import { AuthProvider } from './Hooks/useAuth';
  ```
- [ ] Wrap `<App/>` with `<AuthProvider>` inside `<BrowserRouter>`:
  ```tsx
  createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
          <QueryClientProvider client={queryClient}>
              <BrowserRouter>
                  <AuthProvider>
                      <App />
                  </AuthProvider>
              </BrowserRouter>
          </QueryClientProvider>
      </React.StrictMode>
  );
  ```
- [ ] Lint-fix + typecheck:
  ```bash
  npm run lint:fix && npm run typecheck
  ```
  Expected: 0 errors.
- [ ] Commit:
  ```bash
  git add src/main.tsx
  git commit -m "feat(supabase): mount AuthProvider in app tree"
  ```

---

### Task 10: react-query hooks for matches

**Files:**
- Create: `src/Hooks/useMatches.ts`

> Thin react-query wrappers over the service; manually verified (no unit test). `useAddMatch` invalidates both `['matches']` and `['roster']` because adding a match also touches the roster server-side via the match-start flow — but here we only invalidate matches; roster is remembered separately on match start (Task 14). Keep it focused: invalidate `['matches']`.

- [ ] Implement:
  ```ts
  /* useMatches.ts — react-query layer over the matches service. */

  import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

  import type { MatchRecord } from '../Types/Game';
  import { addMatch, listMatches } from '../Services/matches';
  import { useAuth } from './useAuth';

  /** Query the current user's match history (enabled once auth is ready). */
  export function useMatches() {
      const { status } = useAuth();

      return useQuery({
          queryKey: ['matches'],
          queryFn: listMatches,
          enabled: status === 'ready',
      });
  }

  /** Mutation to persist a finished match; invalidates the history query. */
  export function useAddMatch() {
      const qc = useQueryClient();

      return useMutation({
          mutationFn: (rec: MatchRecord) => addMatch(rec),
          onSuccess: () => {
              qc.invalidateQueries({ queryKey: ['matches'] });
          },
      });
  }
  ```
- [ ] Typecheck:
  ```bash
  npm run typecheck
  ```
  Expected: PASS (0 errors).
- [ ] Commit:
  ```bash
  git add src/Hooks/useMatches.ts
  git commit -m "feat(supabase): useMatches + useAddMatch react-query hooks"
  ```

---

### Task 11: react-query hooks for roster

**Files:**
- Create: `src/Hooks/useRoster.ts`

- [ ] Implement:
  ```ts
  /* useRoster.ts — react-query layer over the roster service. */

  import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

  import type { MatchNames } from '../Types/Game';
  import { listRoster, rememberPlayers } from '../Services/roster';
  import { useAuth } from './useAuth';

  /** Query the current user's roster (enabled once auth is ready). */
  export function useRoster() {
      const { status } = useAuth();

      return useQuery({
          queryKey: ['roster'],
          queryFn: listRoster,
          enabled: status === 'ready',
      });
  }

  /** Mutation to fold a set of names into the roster; invalidates the roster query. */
  export function useRememberPlayers() {
      const qc = useQueryClient();

      return useMutation({
          mutationFn: (names: MatchNames) => rememberPlayers(names),
          onSuccess: () => {
              qc.invalidateQueries({ queryKey: ['roster'] });
          },
      });
  }
  ```
- [ ] Typecheck:
  ```bash
  npm run typecheck
  ```
  Expected: PASS (0 errors).
- [ ] Commit:
  ```bash
  git add src/Hooks/useRoster.ts
  git commit -m "feat(supabase): useRoster + useRememberPlayers react-query hooks"
  ```

---

### Task 12: Settings sync hook

**Files:**
- Create: `src/Hooks/useSettingsSync.ts`

> Pulls the user's settings row into `useSettingsStore` on auth-ready (or inserts the current store defaults if none exists), then debounced write-through on every change. A `hydrated` ref guards the first push so the pull doesn't echo back. Manually verified (no unit test — it bridges async network + Zustand subscription).

- [ ] Implement:
  ```ts
  /* useSettingsSync.ts — bridges useSettingsStore (sync, localStorage-cached) with
   * Supabase: pull-on-auth-ready (hydrate), then debounced write-through on change.
   * Last-write-wins (fine for one user's devices). */

  import { useEffect, useRef } from 'react';

  import { getSettings, upsertSettings } from '../Services/settings';
  import type { Settings } from '../Stores/useSettingsStore';
  import { useSettingsStore } from '../Stores/useSettingsStore';
  import { useAuth } from './useAuth';

  const SETTINGS_KEYS: (keyof Settings)[] = [
      'accent',
      'paperAccent',
      'courtStyle',
      'speed',
      'target',
      'winByTwo',
      'lastMode',
      'singlesNames',
      'doublesNames',
  ];

  function pickSettings(state: Settings): Settings {
      const out = {} as Settings;
      SETTINGS_KEYS.forEach((k) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (out as any)[k] = state[k];
      });

      return out;
  }

  export function useSettingsSync() {
      const { status } = useAuth();
      const hydrated = useRef(false);

      // Pull on auth-ready; insert defaults if the user has no row yet.
      useEffect(() => {
          if (status !== 'ready' || hydrated.current) return;
          let active = true;
          (async () => {
              const remote = await getSettings();
              if (!active) return;
              if (remote) {
                  useSettingsStore.getState().update(remote);
              } else {
                  await upsertSettings(pickSettings(useSettingsStore.getState()));
              }
              hydrated.current = true;
          })().catch(() => {
              // Keep the locally-cached settings; write-through will retry on next change.
              hydrated.current = true;
          });

          return () => {
              active = false;
          };
      }, [status]);

      // Debounced write-through on every change (after hydration).
      useEffect(() => {
          let timer: ReturnType<typeof setTimeout> | undefined;
          const unsub = useSettingsStore.subscribe((state) => {
              if (!hydrated.current) return;
              clearTimeout(timer);
              timer = setTimeout(() => {
                  upsertSettings(pickSettings(state as Settings)).catch(() => {});
              }, 600);
          });

          return () => {
              clearTimeout(timer);
              unsub();
          };
      }, []);
  }
  ```
- [ ] Typecheck:
  ```bash
  npm run typecheck
  ```
  Expected: PASS (0 errors).
- [ ] Commit:
  ```bash
  git add src/Hooks/useSettingsSync.ts
  git commit -m "feat(supabase): useSettingsSync (pull-on-auth + debounced write-through)"
  ```

---

### Task 13: Rewire Autocomplete to `useRoster`

**Files:**
- Modify: `src/Components/Dink/Autocomplete.tsx` (import line 7; roster read line 19)

- [ ] Replace the import:
  ```ts
  import { useRoster } from '../../Hooks/useRoster';
  ```
  (remove `import { useHistoryStore } from '../../Stores/useHistoryStore';`)
- [ ] Replace the roster read (line 19) so it tolerates the query's loading state:
  ```ts
      const { data: roster = [] } = useRoster();
  ```
  (replace `const roster = useHistoryStore((s) => s.roster);`)
- [ ] Lint-fix + typecheck:
  ```bash
  npm run lint:fix && npm run typecheck
  ```
  Expected: 0 errors.
- [ ] Commit:
  ```bash
  git add src/Components/Dink/Autocomplete.tsx
  git commit -m "refactor(supabase): autocomplete reads roster via useRoster"
  ```

---

### Task 14: Rewire History screen for loading/error states

**Files:**
- Modify: `src/Components/Dink/Screens/History.tsx` (props interface lines 8-12; body lines 13-58)

> The screen stays presentational. `DinkApp` (Task 15) passes `loading`/`error` from `useMatches`. Add a loading state and an error state alongside the existing empty state.

- [ ] Extend the props interface:
  ```ts
  interface HistoryScreenProps {
      history: MatchRecord[];
      loading?: boolean;
      error?: boolean;
      onBack: () => void;
      onClear: () => void;
  }
  ```
- [ ] Update the signature to destructure the new props:
  ```ts
  export function HistoryScreen({ history, loading, error, onBack, onClear }: HistoryScreenProps) {
  ```
- [ ] Insert loading + error branches before the `history.length === 0` check (replace the opening of the conditional). The full conditional block becomes:
  ```tsx
              {loading ? (
                  <Card style={{ padding: '40px 22px', textAlign: 'center', marginTop: 8 }}>
                      <div style={{ fontFamily: T.body, fontSize: 13.5, color: T.muted }}>Loading…</div>
                  </Card>
              ) : error ? (
                  <Card style={{ padding: '40px 22px', textAlign: 'center', marginTop: 8 }}>
                      <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 16, color: T.ink }}>
                          Couldn’t load history
                      </div>
                      <div style={{ fontFamily: T.body, fontSize: 13.5, color: T.muted, marginTop: 5 }}>
                          Check your connection and try again.
                      </div>
                  </Card>
              ) : history.length === 0 ? (
                  <Card style={{ padding: '40px 22px', textAlign: 'center', marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.5 }}>
                          {Icon.list({ s: 28, c: T.muted })}
                      </div>
                      <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 16, color: T.ink }}>
                          Nothing here yet
                      </div>
                      <div style={{ fontFamily: T.body, fontSize: 13.5, color: T.muted, marginTop: 5 }}>
                          Play a match and it’ll be saved automatically.
                      </div>
                  </Card>
              ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {history.map((rec: MatchRecord) => (
                          <MatchRow key={rec.id} rec={rec} />
                      ))}
                  </div>
              )}
  ```
- [ ] Lint-fix + typecheck:
  ```bash
  npm run lint:fix && npm run typecheck
  ```
  Expected: 0 errors.
- [ ] Commit:
  ```bash
  git add src/Components/Dink/Screens/History.tsx
  git commit -m "feat(supabase): History screen renders loading/error states"
  ```

---

### Task 15: Rewire `DinkApp` — auth gate, settings sync, match flow

**Files:**
- Modify: `src/Components/Dink/DinkApp.tsx` (imports lines 9-26; store reads lines 33-41; seedRoster effect lines 65-69; `handleStart`/`handleFinish` lines 74-93; `home`/`history` JSX lines 108-142)

> This is the central rewire: drop `useHistoryStore`, read history via `useMatches`, write via `useAddMatch` + `useRememberPlayers`, run `useSettingsSync`, and gate rendering on auth status (splash + retry).

- [ ] Replace the store/hook imports. Remove:
  ```ts
  import { useHistoryStore } from '../../Stores/useHistoryStore';
  ```
  and add:
  ```ts
  import { useAuth } from '../../Hooks/useAuth';
  import { useMatches, useAddMatch } from '../../Hooks/useMatches';
  import { useRememberPlayers } from '../../Hooks/useRoster';
  import { useSettingsSync } from '../../Hooks/useSettingsSync';
  ```
- [ ] Replace the history-store reads (lines 34-37) and run the sync hook. After `const settings = useSettingsStore();` (line 33), use:
  ```ts
      const { status, retry } = useAuth();
      useSettingsSync();

      const matchesQuery = useMatches();
      const matches = matchesQuery.data ?? [];
      const addMatchMut = useAddMatch();
      const rememberMut = useRememberPlayers();
  ```
  (delete the four `useHistoryStore(...)` lines and the `clearMatches`/`seedRoster` references they introduced.)
- [ ] Delete the one-time `seedRoster` effect entirely (lines 65-69) — there is no local roster to backfill anymore.
- [ ] Update `handleStart` to remember players via the mutation (was implicit in the old store). After `startMatch({...})`, add the remember call:
  ```ts
      const handleStart = (cfg: SetupResult) => {
          settings.update({
              lastMode: cfg.mode,
              singlesNames: cfg.singlesNames,
              doublesNames: cfg.doublesNames,
              target: cfg.target,
              winByTwo: cfg.winByTwo,
          });
          rememberMut.mutate(cfg.names);
          startMatch({ mode: cfg.mode, names: cfg.names, target: cfg.target, winByTwo: cfg.winByTwo });
          setScreen('play');
      };
  ```
- [ ] Update `handleFinish` to persist via the mutation:
  ```ts
      const handleFinish = () => {
          const rec = recordMatch();
          if (rec) {
              addMatchMut.mutate(rec);
              setResult(rec);
          }
          setScreen('complete');
      };
  ```
- [ ] Update the `history` screen JSX to pass query states and drop the now-removed `clearMatches`. The Clear action becomes a no-op stub for v1 (no bulk-delete endpoint in scope — wire to an empty handler so the button hides when empty; remove the `onClear` prop pass if you prefer, but keep the prop required). Use:
  ```tsx
      else if (screen === 'history')
          body = (
              <HistoryScreen
                  history={matches}
                  loading={matchesQuery.isLoading}
                  error={matchesQuery.isError}
                  onBack={() => setScreen('home')}
                  onClear={() => {}}
              />
          );
  ```
  > Note: bulk "Clear history" is out of scope for v1 (no delete endpoint in the spec). The button still renders when there are matches; `onClear` is a no-op. If a delete is wanted later, add a `deleteAllMatches()` service + mutation. Leave a `// TODO(v2): wire Clear to a delete mutation` comment above this block.
- [ ] Add the auth gate before the final `return`. Replace the final return with a status switch that shows a splash while loading and a retry screen on error (spec §5/§8):
  ```tsx
      if (status === 'loading') {
          return (
              <AppFrame screenBg={T.bg}>
                  <div
                      style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: T.body,
                          color: T.muted,
                      }}
                  >
                      Loading…
                  </div>
              </AppFrame>
          );
      }
      if (status === 'error') {
          return (
              <AppFrame screenBg={T.bg}>
                  <div
                      style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 14,
                          padding: 24,
                          textAlign: 'center',
                      }}
                  >
                      <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 18, color: T.ink }}>
                          Connect to get started
                      </div>
                      <div style={{ fontFamily: T.body, fontSize: 13.5, color: T.muted, maxWidth: 280 }}>
                          Dink needs a connection on first launch to set up your account.
                      </div>
                      <Btn onClick={retry} style={{ maxWidth: 200 }}>
                          Try again
                      </Btn>
                  </div>
              </AppFrame>
          );
      }

      const screenBg = screen === 'complete' ? T.celebrate : screen === 'play' ? skin.screenBg : T.bg;

      return <AppFrame screenBg={screenBg}>{body}</AppFrame>;
  ```
  (delete the original single `screenBg` + `return` pair at the end so it isn't duplicated.)
- [ ] Add `Btn` to the `UiKit` import (line 26) so the retry button resolves:
  ```ts
  import { AppFrame, Btn } from './UiKit';
  ```
- [ ] Lint-fix + typecheck:
  ```bash
  npm run lint:fix && npm run typecheck
  ```
  Expected: 0 errors. (If TypeScript flags the now-unused `MatchRecord` import or others, remove only those orphaned by this change.)
- [ ] Commit:
  ```bash
  git add src/Components/Dink/DinkApp.tsx
  git commit -m "feat(supabase): rewire DinkApp to auth gate + query/mutation match flow"
  ```

---

### Task 16: Identity-upgrade UI in Settings (magic link + Google + sign out)

**Files:**
- Modify: `src/Components/Dink/Screens/Settings.tsx` (imports lines 6-11; add an Account section before the footer Card at line 163)

> Adds an "Account" block: anonymous users see "Save your data" (email field → magic link, Google button); a signed-in user sees their email + Sign out. Token-driven inline styles, matching the file.

- [ ] Add imports (lint:fix will sort). Add a local state import and the auth/service deps:
  ```ts
  import { useState } from 'react';

  import { linkEmail, linkGoogle, signOut } from '../../../Services/auth';
  import { useAuth } from '../../../Hooks/useAuth';
  import { Btn, Card, Label, Screen, Segmented, TopBar } from '../UiKit';
  ```
  (extend the existing `UiKit` import to include `Btn`; keep the others.)
- [ ] Inside `SettingsScreen`, after `const set = ...` (line 19), add account state + handlers:
  ```ts
      const { user } = useAuth();
      const isAnon = !!user?.is_anonymous;
      const email = user?.email ?? '';
      const [emailInput, setEmailInput] = useState('');
      const [linkMsg, setLinkMsg] = useState('');

      const sendLink = async () => {
          const addr = emailInput.trim();
          if (!addr) return;
          try {
              await linkEmail(addr);
              setLinkMsg('Check your email for a sign-in link.');
          } catch {
              setLinkMsg('That email is already registered — signing you in.');
          }
      };
      const withGoogle = async () => {
          try {
              await linkGoogle();
          } catch {
              setLinkMsg('Couldn’t start Google sign-in.');
          }
      };
  ```
- [ ] Insert the Account section JSX immediately before the footer `<Card>` (line 163). Add:
  ```tsx
              <Label style={{ marginTop: 26 }}>Account</Label>
              {isAnon ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
                      <div style={{ fontFamily: T.body, fontSize: 12.5, color: T.muted }}>
                          Save your data so it follows you across devices.
                      </div>
                      <input
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="you@email.com"
                          type="email"
                          autoComplete="email"
                          style={{
                              border: `1.5px solid ${T.line}`,
                              borderRadius: 13,
                              padding: '13px 14px',
                              fontFamily: T.body,
                              fontWeight: 600,
                              fontSize: 15,
                              color: T.ink,
                              background: T.card,
                              outline: 'none',
                          }}
                      />
                      <Btn onClick={sendLink}>Email me a sign-in link</Btn>
                      <Btn kind="ghost" onClick={withGoogle}>
                          Continue with Google
                      </Btn>
                      {linkMsg && (
                          <div style={{ fontFamily: T.body, fontSize: 12.5, color: T.muted }}>{linkMsg}</div>
                      )}
                  </div>
              ) : (
                  <div
                      style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          marginBottom: 8,
                          padding: '12px 14px',
                          background: T.soft,
                          borderRadius: 14,
                          border: `1px solid ${T.line}`,
                      }}
                  >
                      <span style={{ fontFamily: T.body, fontSize: 13, fontWeight: 600, color: T.ink }}>
                          {email || 'Signed in'}
                      </span>
                      <button
                          onClick={() => signOut()}
                          style={{
                              background: 'none',
                              border: 0,
                              cursor: 'pointer',
                              fontFamily: T.body,
                              fontWeight: 700,
                              fontSize: 13,
                              color: T.muted,
                          }}
                      >
                          Sign out
                      </button>
                  </div>
              )}
  ```
- [ ] Lint-fix + typecheck:
  ```bash
  npm run lint:fix && npm run typecheck
  ```
  Expected: 0 errors.
- [ ] Commit:
  ```bash
  git add src/Components/Dink/Screens/Settings.tsx
  git commit -m "feat(supabase): account upgrade UI (magic link + Google + sign out)"
  ```

---

### Task 17: Retire `useHistoryStore`

**Files:**
- Delete: `src/Stores/useHistoryStore.ts`

> All consumers were rewired in Tasks 13 + 15. Confirm zero references remain, then delete.

- [ ] Confirm no source references remain (the only hits should now be docs):
  ```bash
  npx grep --version >/dev/null 2>&1 || true
  ```
  Then search the codebase for `useHistoryStore` — expect matches only in `CLAUDE.md`, `tasks/todo.md`, and the `docs/` spec/plan (no `src/**` hits). Use the editor's search or:
  ```bash
  git grep -n useHistoryStore -- src
  ```
  Expected: no output (exit code 1 = no matches in `src`).
- [ ] Delete the store:
  ```bash
  git rm src/Stores/useHistoryStore.ts
  ```
- [ ] Typecheck + full test run to prove nothing depended on it:
  ```bash
  npm run typecheck && npm run test
  ```
  Expected: typecheck 0 errors; all test files pass (scoring engine + 3 new mapper suites).
- [ ] Commit:
  ```bash
  git add -A
  git commit -m "refactor(supabase): retire useHistoryStore (replaced by react-query hooks)"
  ```

---

### Task 18: Update docs (`CLAUDE.md` + `tasks/todo.md`)

**Files:**
- Modify: `CLAUDE.md` (State line ~16; Data line ~20; structure block ~63; "react-query is wired but unused" architectural note; Services note)
- Modify: `tasks/todo.md` (add the initiative + review)

- [ ] In `CLAUDE.md`, update the **State** bullet to drop `useHistoryStore`:
  ```
  - **State:** Zustand 5 — `useMatchStore` (live match + snapshot undo), `useSettingsStore` (theme/accent/defaults; localStorage cache + Supabase write-through). Match history + roster moved to react-query hooks over Supabase.
  ```
- [ ] Update the **Data** bullet (ky → supabase-js):
  ```
  - **Data:** `@supabase/supabase-js` (auth + Postgres/RLS) wrapped in `@tanstack/react-query`. `ky` is no longer the data layer.
  ```
- [ ] Update the structure block: replace the `Stores/` line and add `Services/` + the new hooks:
  ```
    Services/                     - supabase client, auth, matches/roster/settings (+ mappers)
    Hooks/                        - useAuth, useMatches, useRoster, useSettingsSync, useDocumentTitle
    Stores/                       - useMatchStore, useSettingsStore
  ```
- [ ] Replace the "**react-query is wired but unused**" architectural-decision paragraph with the active reality:
  ```
  - **Data layer is Supabase + react-query.** History/roster are read via react-query hooks (`useMatches`/`useRoster`) over `@supabase/supabase-js`, written via mutations (`useAddMatch`/`useRememberPlayers`). Settings stay in `useSettingsStore` (synchronous, localStorage-cached so theming paints instantly) and sync to Supabase via `useSettingsSync` (pull-on-auth, debounced write-through). Auth is anonymous-first (`AuthProvider`); RLS isolates per-user rows. Pure mappers in `Services/*` are unit-tested; network calls are manually verified. Don't reintroduce `ky`.
  ```
- [ ] In `tasks/todo.md`, add a new initiative section above "Recently completed":
  ```markdown
  ## Active: Supabase backend (Approach B hybrid)

  Per `docs/superpowers/specs/2026-06-08-supabase-backend-design.md` + plan
  `docs/superpowers/plans/2026-06-08-supabase-backend.md`.

  - [x] Deps + `.env.example`; committed `supabase/schema.sql` (schema + RLS).
  - [x] Supabase client singleton + auth service + AuthProvider/useAuth.
  - [x] Pure mappers (matches/roster/settings) with vitest tests.
  - [x] react-query hooks (useMatches/useAddMatch, useRoster/useRememberPlayers) + useSettingsSync.
  - [x] Rewired Autocomplete, History, DinkApp (auth gate + match flow), Settings (account upgrade).
  - [x] Retired useHistoryStore; updated CLAUDE.md data-layer note.
  ```
- [ ] Lint (docs aren't linted, but run to confirm nothing else broke) + typecheck:
  ```bash
  npm run typecheck
  ```
  Expected: PASS.
- [ ] Commit:
  ```bash
  git add CLAUDE.md tasks/todo.md
  git commit -m "docs(supabase): update data-layer notes + task log"
  ```

---

### Task 19: Final verification

**Files:** none (verification only)

- [ ] Typecheck:
  ```bash
  npm run typecheck
  ```
  Expected: 0 errors.
- [ ] Lint:
  ```bash
  npm run lint
  ```
  Expected: 0 errors (pre-existing HMR-only `react-refresh/only-export-components` warnings on cohesive kit/anim modules are acceptable; do not introduce new ones — `useAuth.tsx` exports both a component and a hook, so expect one such warning there, which is acceptable and consistent with `UiKit.tsx`/`anim.tsx`).
- [ ] Full test suite:
  ```bash
  npm run test
  ```
  Expected: all suites pass — `scoringEngine.test.ts` (unchanged, 15/15) + `matches.test.ts` + `roster.test.ts` + `settings.test.ts`.
- [ ] Production build (proves env-bound client compiles; set throwaway env vars so the singleton doesn't throw at import during build-time evaluation — build does not evaluate the module, but `.env.local` should exist for `npm run dev`):
  ```bash
  npm run build
  ```
  Expected: `tsc -b` clean + Vite build succeeds, `dist/` emitted.
- [ ] Manual verification checklist (spec §9 — requires a configured Supabase project + `.env.local`; run via `npm run dev`):
  - [ ] First load with no session → anonymous session created (Network tab shows `signInAnonymously`); app renders past the splash.
  - [ ] Play + finish a match → a row appears in the Supabase `matches` table.
  - [ ] History screen reads the match back; loading state shows briefly on a cold load.
  - [ ] Setup autocomplete suggests previously-used names (roster round-trip).
  - [ ] Change a setting (e.g. accent) → reload: it persists; open a second browser signed into the same account → it matches.
  - [ ] Settings → "Email me a sign-in link" / "Continue with Google" upgrades the account and keeps the same data (same `user_id`).
  - [ ] RLS: a second account cannot see the first account's matches/roster.
  - [ ] Offline first visit → "Connect to get started" retry screen; "Try again" recovers once online.
- [ ] If all green, push (per project override, direct to `origin/master` is allowed):
  ```bash
  git push origin master
  ```
  Expected: push accepted, no hook failures.

---

## Spec coverage check

- **§3 (architecture):** Tasks 5-7 (services), 10-12 (hooks), 15 (wiring), 17 (retire store). ✓
- **§4 (schema + RLS):** Task 2. ✓
- **§5 (auth flow):** Tasks 4 (wrappers), 8-9 (provider), 16 (upgrade UI). ✓
- **§6 (client data layer):** Tasks 3-7 (`Services/`), 8-12 (`Hooks/`). ✓
- **§7 (config & secrets):** Task 1 (`.env.example`, dep), Task 2 note (Cloudflare build vars). ✓
- **§8 (error handling):** Task 14 (history loading/error), Task 15 (splash/retry gate). ✓
- **§9 (testing):** Tasks 5-7 (mapper tests), Task 19 (full suite + manual checklist). ✓
- **§10 (manual Supabase setup):** Task 2 manual note. ✓
- **§11/§12 (limitations / out of scope):** honoured — no merge, no offline queue, Clear-history left as a v2 TODO in Task 15. ✓
- **§13 (file-level change summary):** mirrored in File Structure + Tasks. ✓
