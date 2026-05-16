# Project: score-pickleball

> Global behavioral guidelines live in `~/.claude/CLAUDE.md`. This file covers what's unique to this project.

---

## What this project does

A browser-based pickleball scorekeeper. Tracks singles/doubles scores, server position, side-out logic, and game-win conditions, with an animated court layout and a rules reference page. Originally a single-file HTML app (preserved at `legacy/index.html`); now a React + TypeScript SPA designed so additional score-display layouts can be plugged in alongside the current court view.

## Tech stack

- **Language:** TypeScript 5.9, React 19
- **Build:** Vite 7
- **Styling:** Tailwind v4 (via `@tailwindcss/vite`) + CSS variables for theme tokens
- **State:** Zustand 5 (`useGameStore`, `useThemeStore`)
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
  App.tsx                       - routes (/score, /rules, redirect /, 404)
  main.tsx                      - entry, react-query provider
  Components/
    Layout.tsx                  - app shell, tab bar, theme toggle
    Score/
      SetupScreen.tsx           - format / play-to / player names
      Layouts/                  - pluggable in-game layouts (CourtLayout is first)
      Shared/                   - ServeBar, GameActions, ScoreLog, WinOverlay, InlineEdit
    Rules/                      - RulesContent, CourtDiagram
  Pages/                        - Score, Rules, NotFound (thin route components)
  Stores/                       - useGameStore (+ undo history), useThemeStore (persisted)
  Hooks/                        - useApplyTheme, useDocumentTitle
  Utils/
    scoringEngine.ts            - pure scoring logic
    scoringEngine.test.ts       - unit tests
    scoreLog.ts                 - log-entry helpers
  Types/Game.ts                 - game state types
legacy/index.html               - original single-file app, kept for reference
tasks/todo.md                   - current task list
```

## Architectural decisions

- **Scoring is a pure function.** All score transitions go through `src/Utils/scoringEngine.ts`. Components and stores never mutate score state directly — they call the engine and store the result. Tests live next to it (`scoringEngine.test.ts`) and must stay green.
- **Undo is snapshot-based.** `useGameStore` pushes a snapshot of the prior state onto a history stack on every recorded point. Undo pops and replaces. Don't build incremental inverse-operations — keep using snapshots.
- **Layouts are pluggable.** The in-game UI is selected from `src/Components/Score/Layouts/`. To add a new one: create `Layouts/<Name>/<Name>.tsx` + `.css`, compose shared widgets from `Score/Shared/`, read state via `useGameStore`, and switch which layout `Pages/Score.tsx` renders. A layout store will eventually pick this; for now `Score.tsx` hardcodes the choice.
- **Theme via CSS variables, not Tailwind tokens.** Dark/light tokens are defined as CSS variables and toggled by `useApplyTheme` + `useThemeStore` (persisted). Don't replace these with Tailwind's `dark:` variants — the existing tokens are pixel-faithful to the legacy app and a drift risk.
- **react-query is wired but unused.** The provider is mounted in `main.tsx` and `ky` is installed in preparation for a backend. There is no `Services/` folder yet — add one (with ky-based clients) when API calls land. Don't introduce a different data layer.
- **Folder casing is PascalCase.** `Components/`, `Stores/`, `Utils/`, etc. Match this when adding directories.

## Conventions specific to this project

- **Imports are auto-sorted** by `eslint-plugin-simple-import-sort`. Don't hand-order them — `npm run lint:fix` will.
- **Co-locate component CSS:** `Foo.tsx` ships with `Foo.css` in the same folder.
- **Route components in `Pages/` are thin.** Page-level orchestration only; UI lives in `Components/`.

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

Per `tasks/todo.md`, the HTML→React port is complete. Next likely work:
- Additional score layouts under `Components/Score/Layouts/`
- A layout-selection store/setting
- Backend integration (will introduce `src/Services/` with ky clients)

## Related files

- @tasks/todo.md — current task list and porting review notes
- @tasks/lessons.md — lessons from past corrections (if present)
