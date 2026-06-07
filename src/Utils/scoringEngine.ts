/* scoringEngine.ts — Dink match engine (pure).
 *
 * One engine drives BOTH singles and doubles. `freshState` builds the start
 * state from a config; `award` applies a rally outcome and returns the next
 * state (including the serve-change `event` for the announce banner); `winnerOf`
 * detects a finished game (target + win-by-2). No mutation, no `Date`, no
 * `localStorage` — timestamps and the undo stack live in the store. */

import type {
    DoublesNames,
    MatchConfig,
    MatchState,
    Pair,
    Positions,
    ServeEventKind,
    TeamIdx,
} from '../Types/Game';

/** Initial state for a new match. */
export function freshState(config: MatchConfig): MatchState {
    return {
        mode: config.mode,
        names: config.names,
        target: config.target,
        winByTwo: config.winByTwo,
        score: [0, 0],
        server: 0,
        serverD: { team: 0, number: 2 },
        serverPlayer: 0,
        positions: [
            [0, 1],
            [0, 1],
        ],
        isFirstService: true,
        event: null,
    };
}

/** The player who serves first for `team` on a side-out: the one whose current
 * court matches the team's score parity (right court when even, left when odd). */
function incomingServer(positions: Positions, score: [number, number], team: TeamIdx): number {
    return positions[team][score[team] % 2 === 0 ? 0 : 1];
}

/** Winner team index, or null if the game is still live. */
export function winnerOf(
    score: [number, number],
    target: number,
    winByTwo: boolean
): TeamIdx | null {
    const [a, b] = score;
    const top = Math.max(a, b);
    if (top < target) return null;
    if (winByTwo && Math.abs(a - b) < 2) return null;

    return a > b ? 0 : 1;
}

/** Name of whoever is serving in a given state (matches the court highlight). */
export function serverNameOf(state: MatchState): string {
    if (state.mode === 'singles') {
        return (state.names as Pair)[state.server];
    }
    const t = state.serverD.team;

    return (state.names as DoublesNames)[t][state.serverPlayer];
}

/**
 * Apply a rally win to the serving/receiving logic and return the next state.
 * `winner` is the team index (0 = bottom half, 1 = top half) that won the rally.
 */
export function award(s: MatchState, winner: TeamIdx): MatchState {
    const next: MatchState = { ...s };
    let kind: ServeEventKind = 'point';

    if (s.mode === 'singles') {
        if (winner === s.server) {
            next.score = s.score.map((v, i) => (i === s.server ? v + 1 : v)) as [number, number];
        } else {
            next.server = (1 - s.server) as TeamIdx;
            kind = 'sideout';
        }
    } else {
        const t = s.serverD.team;
        if (winner === t) {
            // Serving team scores: same player keeps serving, partners swap courts.
            next.score = s.score.map((v, i) => (i === t ? v + 1 : v)) as [number, number];
            next.positions = s.positions.map((tm, ti) =>
                ti === t ? [tm[1], tm[0]] : tm
            ) as MatchState['positions'];
            next.isFirstService = false;
        } else if (s.isFirstService) {
            // 0-0-2 rule: only one player serves before the first side-out.
            const nt = (1 - t) as TeamIdx;
            next.serverD = { team: nt, number: 1 };
            next.serverPlayer = incomingServer(next.positions, next.score, nt);
            next.isFirstService = false;
            kind = 'sideout';
        } else if (s.serverD.number === 1) {
            // Server 1 lost: the partner serves as server 2 (no swap).
            next.serverD = { team: t, number: 2 };
            next.serverPlayer = 1 - s.serverPlayer;
            kind = 'second';
        } else {
            // Server 2 lost: side-out to the other team's first server.
            const nt = (1 - t) as TeamIdx;
            next.serverD = { team: nt, number: 1 };
            next.serverPlayer = incomingServer(next.positions, next.score, nt);
            kind = 'sideout';
        }
    }

    const w = winnerOf(next.score, s.target, s.winByTwo);
    const seq = (s.event?.seq ?? 0) + 1;
    const team = next.mode === 'singles' ? next.server : next.serverD.team;
    next.event = { kind, name: serverNameOf(next), team, over: w != null, seq };

    return next;
}
