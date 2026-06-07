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

## Active: "Dink" v2 — theme-by-style + in-app rules + responsive desktop

New design bundle (`Otgdv3Bjyuo5iI-_XDqVLg`) adds a theming overhaul + in-app rules. Plus user asks for a real responsive desktop layout (mobile = mockup, desktop = appropriate, not phone-limited).

### Plan

1. [x] Theme-by-style: `APP_THEMES` per skin re-skins the whole app via `--app-*` CSS vars; `T` tokens are var-backed (+ `celebrate`).
2. [x] Accent model: Court→PALETTES, Paper→PAPER_PALETTES (rust/pine/navy/plum), Neon/Glass/Split→FIXED_ACCENTS; `resolveAccent`. Added `paperAccent` setting.
3. [x] Settings restructure: Theme picker → Accent (palette or "built-in" note) → Animation speed. Removed game-to + win-by-2 + old Rules link.
4. [x] In-app Rules: `Rules.tsx` (RulesScreen + RulesSheet + RulesBody/ServeDiagram). Home "How to play" button; Play header `?` sheet.
5. [x] Skins: paper accent follows `--accent`. Card backdrop-blur var. New Icon.help/book. Complete uses `celebrate` + accent glow.
6. [x] Removed superseded standalone `/rules` page + `Components/Rules/*` + `useThemeStore`/`useApplyTheme`.
7. [x] Responsive desktop: mobile full-bleed (mockup); ≥768px centered elevated card; ≥1024px themed brand rail + app surface on accent-glow backdrop (Home hero hidden on desktop to avoid dupe).
8. [x] Verified: typecheck, lint 0 errors, 14/14 tests, build OK; browser flow across Court/Neon/Glass/Paper themes, rules screen + in-game sheet, mobile + desktop (screenshots captured).

### Review (v2)

Ported the design2 bundle (`Otgdv3Bjyuo5iI-_XDqVLg`): the **Court Style now themes the whole app**, not just the board. `theme.ts` gained `APP_THEMES` (per-style shell tokens), `PAPER_PALETTES`, `FIXED_ACCENTS`, and `resolveAccent`; `T` is CSS-var-backed (`--app-*`) and `DinkApp` writes the chosen style's tokens + resolved accent to the root each time the style/accent changes. Settings was restructured (Theme → Accent picker / built-in-accent note → Animation speed) and the game-to / win-by-2 defaults removed (still set per match on Setup). Added the in-app **"How to play"** (`Rules.tsx`): a full `RulesScreen` from Home and a themed `RulesSheet` from the play header `?`. The old standalone `/rules` page + its light/dark theme system (`useThemeStore`/`useApplyTheme`/`Components/Rules`) were removed as superseded.

For **responsive desktop** (user ask, beyond the mockup): `AppFrame` + `dink.css` give mobile a full-bleed mockup, tablet a centered elevated card, and desktop a themed **brand rail beside the app surface** on an accent-glow backdrop — all reskinning per theme. The existing screens are reused unchanged in the app surface; Home's hero is hidden on desktop since the rail carries it.

Verified in-browser (screenshots now work): theme-by-style across Court/Neon/Glass/Paper (incl. the rail), accent pickers vs. built-in note, the rules screen + in-game sheet, and mobile↔desktop layouts. Engine untouched (14/14). HMR-only `react-refresh` warnings remain on cohesive kit/anim modules.

## Recently completed

- **Rules content**: restored important info the compact rewrite dropped (court zones/dimensions, 15/21 game options, win-by-2 no-cap) and added serve-validity rules — a net-cord serve that lands in the correct box is good, while landing in the kitchen or on the kitchen line is a fault (other service lines are in). New `The court` and `Net serves & the line` items in `Rules.tsx`.
- **Doubles second-server bugfix**: each team now gets two servers — on a service change the **partner** serves as server 2 (was incorrectly keeping the same player). Added an explicit `serverPlayer` to the match state; `award` flips it to the partner on the `second` event and recomputes it by court parity for the incoming team on a side-out (0-0-2 opening kept as a single server). The serve-change banner now reads "Second serve · <partner name>". Engine test added (15/15). See `tasks/lessons.md`.

- **HTML → React port** (branch `claude/wizardly-wing-989c14`): single-file `legacy/index.html` ported to a Vite + React 19 + TS + Tailwind v4 app. Pluggable layout structure under `src/Components/Score/Layouts/`. Pure scoring engine + Zustand stores + snapshot undo. react-query/ky provisioned for a future backend. Verified: typecheck, lint, 13/13 unit tests, browser smoke test (setup → start game → record point → undo → rules page → theme toggle, no console errors).

## How this file is used

- Add the next initiative's plan here as a checklist before starting non-trivial work.
- Mark items `[x]` as you go.
- Write a brief Review section when the initiative ships, then trim back to "No active tasks" once it's merged.
