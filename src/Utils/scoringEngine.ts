import type { GameState, Team } from '../Types/Game';
import { opponent } from '../Types/Game';

/**
 * Apply a rally outcome to the game state and return the new state.
 *
 * Pure: takes the previous state + rally winner, returns the next state.
 * No mutation, no side effects — easy to unit test and to plug into undo/replay.
 */
export function applyRally(state: GameState, rallyWinner: Team): GameState {
    if (state.phase !== 'playing') {
        return state;
    }

    const next: GameState =
        state.format === 'doubles'
            ? applyDoublesRally(state, rallyWinner)
            : applySinglesRally(state, rallyWinner);

    return checkWin(next);
}

function applyDoublesRally(state: GameState, rallyWinner: Team): GameState {
    if (rallyWinner === state.serving) {
        // Serving team wins: score, keep serving, switch sides.
        return {
            ...state,
            scores: {
                ...state.scores,
                [rallyWinner]: state.scores[rallyWinner] + 1,
            },
            serveSide: state.serveSide === 'R' ? 'L' : 'R',
            isFirstServe: false,
        };
    }

    // Receiving team wins the rally — no point, serve rotates.
    if (state.isFirstServe) {
        // Very first serve of the game: skip server 2, hand to other team's server 1.
        return {
            ...state,
            serving: rallyWinner,
            serverNum: 1,
            serveSide: 'R',
            isFirstServe: false,
        };
    }

    if (state.serverNum === 1) {
        // Hand to server 2 on the same team — partner is on the other side.
        return {
            ...state,
            serverNum: 2,
            serveSide: state.serveSide === 'R' ? 'L' : 'R',
            isFirstServe: false,
        };
    }

    // Server 2 loses — rotate to other team, server 1.
    return {
        ...state,
        serving: rallyWinner,
        serverNum: 1,
        serveSide: 'R',
        isFirstServe: false,
    };
}

function applySinglesRally(state: GameState, rallyWinner: Team): GameState {
    if (rallyWinner === state.serving) {
        return {
            ...state,
            scores: {
                ...state.scores,
                [rallyWinner]: state.scores[rallyWinner] + 1,
            },
            isFirstServe: false,
        };
    }

    return {
        ...state,
        serving: rallyWinner,
        isFirstServe: false,
    };
}

function checkWin(state: GameState): GameState {
    const { scores, playTo } = state;
    let winner: Team | null = null;

    if (scores.A >= playTo && scores.A - scores.B >= 2) {
        winner = 'A';
    } else if (scores.B >= playTo && scores.B - scores.A >= 2) {
        winner = 'B';
    }

    if (!winner) {
        return state;
    }

    return { ...state, winner, phase: 'ended' };
}

/**
 * Returns the serving player's side ('R' or 'L') from their own perspective.
 * In singles this is derived from the serving team's score parity.
 */
export function currentServeSide(state: GameState): 'R' | 'L' {
    if (state.format === 'doubles') {
        return state.serveSide;
    }

    return state.scores[state.serving] % 2 === 0 ? 'R' : 'L';
}

/**
 * Map a player-perspective side ('R' / 'L') to a screen position ('sl' / 'sr').
 *
 * Team A is at the top of the screen facing down → their R is screen-right.
 * Team B is at the bottom facing up → their R is screen-left.
 */
export function sideToScreen(team: Team, side: 'R' | 'L'): 'sl' | 'sr' {
    if (team === 'A') {
        return side === 'R' ? 'sr' : 'sl';
    }

    return side === 'R' ? 'sl' : 'sr';
}

export function receivingTeam(state: Pick<GameState, 'serving'>): Team {
    return opponent(state.serving);
}
