# Project: score-pickleball

> Global behavioral guidelines live in `~/.claude/CLAUDE.md`. This file covers what's unique to this project.

---

## What this project does

A browser-based pickleball scorekeeper ("Dink"). Tracks singles/doubles scores, server position, side-out logic, and game-win conditions on a court-shaped animated scoreboard. Mobile-first single-flow app: Home → New Match → live court → Match Complete → History, plus Settings (4 accent themes × 5 court "skins"). A standalone Rules reference page is kept as an extra. Originally a single-file HTML app (preserved at `legacy/index.html`), first ported to a generic React SPA, then redesigned to the current "Dink" app from a Claude Design handoff.

## Tech stack

- **Language:** TypeScript 5.9, React 19
- **Build:** Vite 7
- **Styling:** Tailwind v4 (via `@tailwindcss/vite`) + CSS variables for theme tokens
- **State:** Zustand 5 — `useMatchStore` (live match + snapshot undo), `useSettingsStore` (persisted accent/skin/defaults), `useHistoryStore` (persisted match history + player roster), `useThemeStore` (light/dark, only for the Rules page)
- **Routing:** react-router 7
- **Data:** `@tanstack/react-query` + `ky` are installed and wired up but unused — provisioned for a future backend
- **Testing:** Vitest 4 + Testing Library + jsdom
- **Lint:** ESLint 9 (flat config) with `simple-import-sort`, `import`, `react-hooks`, `react-refresh`, `typescript-eslint`

## How to run it

```bash
# Install
npm install

# Run locally
npm run dev

# Run tests
npm run test          # one-shot
npm run test:watch    # watch mode

# Typecheck / lint
npm run typecheck
npm run lint
npm run lint:fix

# Production build
npm run build
```

## Project structure

```
src/
  App.tsx                       - routes ("/" → Dink app, "/rules", 404)
  main.tsx                      - entry, react-query provider, BrowserRouter
  Components/
    Dink/                       - the whole Dink app (token-driven inline styles)
      DinkApp.tsx               - shell: screen state, accent theming, lifecycle
      theme.ts                  - tokens: T, PALETTES (accents), SPEEDS, fonts
      skins.ts                  - the 5 court-style token maps + SKIN_ORDER
      dink.css                  - global keyframes + .dink-btn/.ex-edit-name rules
      Atoms.tsx / UiKit.tsx / Autocomplete.tsx   - shared UI kit + frame
      anim.tsx                  - FLIP, +1 pips, ripple, announce banner, paddle token
      Scoreboard.tsx / Overlays.tsx              - the court board + win/confirm
      Screens/                  - Home, Setup, Play, Complete, History, Settings, MatchRow
    Rules/                      - RulesContent, CourtDiagram (kept as an extra)
  Pages/                        - Rules, NotFound (thin route components)
  Stores/                       - useMatchStore, useSettingsStore, useHistoryStore, useThemeStore
  Hooks/                        - useApplyTheme, useDocumentTitle
  Utils/
    scoringEngine.ts            - pure match engine (freshState/award/winnerOf)
    scoringEngine.test.ts       - unit tests
    courtView.ts                - pure callout/court-placement view helpers
    roster.ts                   - pure player-catalogue helpers (autocomplete)
  Types/Game.ts                 - match model + record/roster/skin/accent types
legacy/index.html               - original single-file app, kept for reference
tasks/todo.md                   - current task list
```

## Architectural decisions

- **Scoring is a pure function.** All score transitions go through `src/Utils/scoringEngine.ts` (`freshState`/`award`/`winnerOf`) — no `Date`, no `localStorage`, no mutation. `useMatchStore` calls it and stores the result; `courtView.ts` derives the display (callouts, court placement) purely. Tests live next to the engine (`scoringEngine.test.ts`) and must stay green.
- **Undo is snapshot-based.** `useMatchStore` pushes a snapshot of the prior state onto a history stack on every awarded point. Undo pops and replaces. Don't build incremental inverse-operations — keep using snapshots.
- **Skins are token maps, not separate components.** One `Scoreboard` renders all five court styles by reading a skin's token object from `skins.ts`. To add a style: add an entry to `SKINS` + `SKIN_ORDER` and a `SkinId` in `Types/Game.ts` — do **not** fork the component. Accents (`PALETTES` in `theme.ts`) drive a live `--accent` CSS var set by `DinkApp`.
- **Dink styling is token-driven inline styles, not co-located CSS.** Because one component must render 5 skins pixel-faithfully, the Dink components use inline `style` objects fed by `theme.ts`/`skins.ts` tokens. `dink.css` holds only global keyframes and pseudo-class rules. Don't try to convert these to per-component CSS files — it fights the skin system. (The Rules page still uses co-located CSS — see below.)
- **Theme via CSS variables.** The Dink app sets `--accent`/`--accent-ink` from the chosen palette. The Rules page (kept as an extra) still uses the legacy light/dark CSS-variable tokens toggled by `useApplyTheme` + `useThemeStore`; that system no longer affects the Dink app. Don't replace either with Tailwind's `dark:` variants.
- **react-query is wired but unused.** The provider is mounted in `main.tsx` and `ky` is installed in preparation for a backend. There is no `Services/` folder yet — add one (with ky-based clients) when API calls land. Don't introduce a different data layer.
- **Folder casing is PascalCase.** `Components/`, `Stores/`, `Utils/`, etc. Match this when adding directories.

## Conventions specific to this project

- **Imports are auto-sorted** by `eslint-plugin-simple-import-sort`. Don't hand-order them — `npm run lint:fix` will.
- **Co-locate component CSS for non-Dink components:** `Foo.tsx` ships with `Foo.css` (e.g. the Rules components). Dink components are the exception — they use token-driven inline styles (see Architectural decisions).
- **Route components in `Pages/` are thin.** Page-level orchestration only; UI lives in `Components/`. The Dink app manages its own internal screens via state in `DinkApp.tsx` (no router per screen).

## Overrides to global Version Control Hygiene

The global rules in `~/.claude/CLAUDE.md` §11 apply, **with these overrides:**

- **Direct commits to `master` are allowed.** This project doesn't use a PR workflow; the wrap-up push goes to `origin/master` directly.

Push-on-success and worktree pruning behave as the global rules describe — no project-specific change.

## Domain knowledge / jargon

- **Side-out** — the serving team loses the rally; serve passes to the other team (in doubles, after both partners have served).
- **Server number (1 / 2)** — in doubles, which of the two teammates is currently serving. Resets to 2 after the first side-out of the game (standard pickleball "start-of-game" rule).
- **Play-to** — the target score for the game (typically 11, sometimes 15 or 21). Configured on the setup screen.
- **Score format** — "team-score / opponent-score / server-number" called before each serve.

## Known gotchas

- **Don't edit `legacy/index.html`.** It's an intentional reference snapshot of the original single-file app. Port behavior into React components instead.
- **Tailwind v4 uses `@tailwindcss/vite`, not a `tailwind.config.js`.** Configuration lives in CSS via `@theme` / `@layer`. Don't add a JS config file.
- **Tests run in jsdom** (`src/test-setup.ts`). Anything that touches real DOM APIs unavailable in jsdom (e.g., layout measurements) needs to be mocked or skipped.

## Current focus

Per `tasks/todo.md`, the "Dink" redesign (Claude Design handoff) is complete. Next likely work:
- Additional court skins (add to `SKINS`/`SKIN_ORDER` + a `SkinId`)
- Backend integration (will introduce `src/Services/` with ky clients)

## Related files

- @tasks/todo.md — current task list and porting review notes
- @tasks/lessons.md — lessons from past corrections (if present)
