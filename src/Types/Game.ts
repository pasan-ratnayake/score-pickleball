/* Dink match model — drives both singles and doubles through one pure engine. */

export type Mode = 'singles' | 'doubles';
export type Target = 11 | 15 | 21;
/** Accent theme key for the Court style (colours live in Dink/theme.ts). */
export type AccentKey = 'green' | 'clay' | 'grape' | 'ocean';
/** Accent key for the Paper style (earthy ink-on-cream tones). */
export type PaperAccentKey = 'rust' | 'pine' | 'navy' | 'plum';
/** Court-style / skin key (tokens live in Dink/skins.ts). */
export type SkinId = 'court' | 'broadcast' | 'glass' | 'split' | 'paper';
/** Animation speed preset. */
export type Speed = 'calm' | 'default' | 'snappy';
export type TeamIdx = 0 | 1;
export type ServerNum = 1 | 2;
export type Court = 'left' | 'right';

/** A team's two players (doubles) or the two singles players. */
export type Pair = [string, string];
/** Doubles: two teams of two. */
export type DoublesNames = [Pair, Pair];
/** Singles names are a Pair; doubles names are a DoublesNames. */
export type MatchNames = Pair | DoublesNames;

export interface DoublesServer {
    team: TeamIdx;
    number: ServerNum;
}

/** Doubles court positions per team: [rightCourtIdx, leftCourtIdx]. */
export type Positions = [[number, number], [number, number]];

export type ServeEventKind = 'point' | 'sideout' | 'second';

export interface ServeEvent {
    kind: ServeEventKind;
    /** Name of whoever is serving after this event (for the announce banner). */
    name: string;
    /** Serving team after the event (0 = bottom half, 1 = top half). */
    team: TeamIdx;
    /** True when this event ended the game. */
    over: boolean;
    /** Monotonic counter so the banner re-fires on every new event. */
    seq: number;
}

export interface MatchConfig {
    mode: Mode;
    names: MatchNames;
    target: Target;
    winByTwo: boolean;
}

/** The pure, snapshot-able core of a live match. Timestamps live in the store. */
export interface MatchState {
    mode: Mode;
    names: MatchNames;
    target: Target;
    winByTwo: boolean;
    score: [number, number];
    /** Singles server (0 | 1). */
    server: TeamIdx;
    /** Doubles server. */
    serverD: DoublesServer;
    /** Doubles court positions per team: [rightCourtIdx, leftCourtIdx]. */
    positions: Positions;
    /** True until the first side-out (the 0-0-2 first-service rule). */
    isFirstService: boolean;
    /** Last serve-change event, for the announce banner. */
    event: ServeEvent | null;
}

export const isSingles = (s: Pick<MatchState, 'mode'>): boolean => s.mode === 'singles';

/** Narrow names to the singles pair. */
export const singlesNames = (s: Pick<MatchState, 'names'>): Pair => s.names as Pair;
/** Narrow names to the doubles structure. */
export const doublesNames = (s: Pick<MatchState, 'names'>): DoublesNames => s.names as DoublesNames;

/* ── A finished-match record (history + complete screen) ───────────────── */
export interface MatchRecord {
    id: string;
    mode: Mode;
    /** Singles: [string, string]; doubles: [[string,string],[string,string]]. */
    names: MatchNames;
    score: [number, number];
    winner: TeamIdx;
    target: Target;
    durationMs: number;
    date: number;
}

/* ── Player roster (autocomplete catalogue) ────────────────────────────── */
export interface RosterEntry {
    name: string;
    /** Times played. */
    n: number;
    /** Last-played timestamp. */
    at: number;
}
