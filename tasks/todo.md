# Tasks

## Active: "Dink" redesign — implement the Claude Design handoff

Source design bundle: `pickleball-scoring-app/project/app/Dink.html` (+ engine/anim/ui/skins/scoreboard/screens jsx).
Port the prototype's **visual output** into the React 19 + TS + Vite app (match pixels, not internal structure).

Confirmed scope decisions:
- **Drop the fake phone mockup** → responsive, mobile-first, centered app column on desktop.
- **Full design**: all 5 court skins (Court/Neon/Glass/Split/Paper), 4 accents, FLIP animations + "+1" pips + side-out banners, autocomplete/roster, undo, confirm dialogs, Home/Setup/Play/Complete/History/Settings, localStorage.
- **Keep the existing Rules page** as an extra, reachable from Settings.

### Plan

1. [x] Types — rewrote `Types/Game.ts` to the Dink match model.
2. [x] Pure engine — rewrote `Utils/scoringEngine.ts` (`freshState`, `award`, `winnerOf`) + `Utils/courtView.ts` view helpers. Pure, no `Date`/`localStorage`.
3. [x] Tests — rewrote `Utils/scoringEngine.test.ts` (singles parity, doubles 0-0-2 + side-outs + swaps, win-by-2). 14/14 green.
4. [x] Stores — `useMatchStore` (match + snapshot undo + `useMatchView`), `useSettingsStore` (persist), `useHistoryStore` (persist matches + roster). Removed old `useGameStore`.
5. [x] Tokens — `Components/Dink/theme.ts`, `skins.ts`, `dink.css`.
6. [x] UI kit — `Atoms` (Paddle, EditableName), `UiKit` (Icon/Btn/Segmented/Toggle/Card/Label/TopBar/Screen/AppFrame), `Autocomplete`.
7. [x] Animation layer — `anim.tsx` (FLIP, fx, announce, token layer, callout, tap handlers).
8. [x] Scoreboard — `Scoreboard.tsx` + `Overlays.tsx`.
9. [x] Screens — Home/Setup/Play/Complete/History/Settings + `MatchRow`.
10. [x] Shell + routing — `DinkApp.tsx`; `App.tsx` routes (`/` → Dink, `/rules` → Rules with back nav); fonts/title in `index.html`.
11. [x] Removed superseded old Score impl + old Layout/Score page; kept Rules (reachable from Settings).
12. [x] Verified — typecheck clean, lint 0 errors (8 HMR-only warnings), 14/14 tests, production build OK, full browser flow exercised.

### Review

Implemented the "Dink" handoff as the new app, dropping the prototype's fake phone frame for a responsive mobile-first column (`AppFrame`). The prototype's `window`-global JSX was ported to typed React modules under `src/Components/Dink/`, keeping the **token-driven inline-style** approach (one `Scoreboard` renders all 5 skins from `skins.ts`). Scoring is a pure engine (`scoringEngine.ts` + `courtView.ts`); the live match lives in `useMatchStore` with snapshot undo, exposed to the board via `useMatchView`. Settings + history/roster persist via Zustand `persist`.

Kept the existing Rules page as an extra (per request) at `/rules`, linked from Settings; it retains the old light/dark theme system (`useThemeStore`/`useApplyTheme`), which no longer affects the Dink app.

Verified end-to-end in the browser: singles + doubles scoring/side-outs/undo, 0-0-2 rule, win → Complete → History, localStorage persistence, skin + accent switching, Rules round-trip. No console errors. (`preview_screenshot` is non-functional in this sandbox — times out on every page incl. plain Rules — so verification was via DOM/state inspection.)

Note: `react-refresh/only-export-components` warnings remain on `UiKit.tsx` and `anim.tsx` (cohesive modules that export hooks/helpers alongside components) — HMR-only, non-blocking.

## Recently completed

- **HTML → React port** (branch `claude/wizardly-wing-989c14`): single-file `legacy/index.html` ported to a Vite + React 19 + TS + Tailwind v4 app. Pluggable layout structure under `src/Components/Score/Layouts/`. Pure scoring engine + Zustand stores + snapshot undo. react-query/ky provisioned for a future backend. Verified: typecheck, lint, 13/13 unit tests, browser smoke test (setup → start game → record point → undo → rules page → theme toggle, no console errors).

## How this file is used

- Add the next initiative's plan here as a checklist before starting non-trivial work.
- Mark items `[x]` as you go.
- Write a brief Review section when the initiative ships, then trim back to "No active tasks" once it's merged.
