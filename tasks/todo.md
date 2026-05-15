# Convert score-pickleball single-file HTML → React app

## Goal
Port the existing single-page `index.html` pickleball scorer into a full React + TypeScript app following the package/structure conventions used in the `Bingo` repo, so future layouts can be added cleanly.

## Plan
- [x] Scaffold Vite + React 19 + TS + Tailwind v4 + ESLint + Vitest
- [x] Preserve dark/light theme tokens via CSS variables (no design drift)
- [x] Pure scoring engine (`Utils/scoringEngine.ts`) + unit tests
- [x] Zustand stores: `useGameStore` (game state + undo history), `useThemeStore` (persisted)
- [x] Routes: `/score`, `/rules`, redirect `/` → `/score`, 404 fallback
- [x] `Layout` with tab bar + theme toggle (NavLink-based)
- [x] `SetupScreen` (format / play-to / names)
- [x] `CourtLayout` — first of N pluggable layouts, lives at `Components/Score/Layouts/CourtLayout/`
- [x] Shared in-game widgets: `ServeBar`, `GameActions`, `ScoreLog`, `WinOverlay`, `InlineEdit`
- [x] `RulesContent` + `CourtDiagram`
- [x] react-query provider wired up (provision for future backend, no calls yet)
- [x] Original HTML preserved at `legacy/index.html` for reference
- [x] Run install + typecheck + lint + tests

## Adding a new score layout (for future work)
1. Create `src/Components/Score/Layouts/<Name>/<Name>.tsx` + `.css`
2. Compose shared widgets from `src/Components/Score/Shared/*` as needed
3. Read state with `useGameStore`, dispatch via `recordPoint` / `undo` / etc.
4. Switch which layout renders inside `src/Pages/Score.tsx` (eventually a setting in a layout store)

## Review
- Pixel-faithful port of the original UI; colors, animations, court rendering preserved
- Game logic isolated in `Utils/scoringEngine.ts` — pure, fully unit-tested
- State centralized in Zustand, with snapshot-based undo
- Layout is pluggable: `Score.tsx` selects which layout to render — drop in new layouts under `Layouts/`
- Provision for backend: react-query is wired up but unused; add a `Services/` folder + ky calls when the API arrives
