import { useMemo } from 'react';
import { create } from 'zustand';

import type {
    Court,
    DoublesNames,
    MatchConfig,
    MatchRecord,
    MatchState,
    Pair,
    ServeEvent,
    Target,
    TeamIdx,
} from '../Types/Game';
import type { CourtView } from '../Utils/courtView';
import { award as engineAward, freshState, winnerOf } from '../Utils/scoringEngine';

interface MatchStore {
    state: MatchState | null;
    /** Undo snapshots of prior core states. */
    past: MatchState[];
    createdAt: number;
    finishedAt: number | null;

    start: (config: MatchConfig) => void;
    award: (winner: TeamIdx) => void;
    undo: () => void;
    setName: (idx: number, a: number | string, b?: string) => void;
    /** Restart with the same config (rematch). */
    reset: () => void;
    /** Build a history record from the current match (or null if none). */
    record: () => MatchRecord | null;
}

let recordSeq = 0;

export const useMatchStore = create<MatchStore>((set, get) => ({
    state: null,
    past: [],
    createdAt: 0,
    finishedAt: null,

    start: (config) =>
        set({ state: freshState(config), past: [], createdAt: Date.now(), finishedAt: null }),

    award: (winner) => {
        const { state, past, finishedAt } = get();
        if (!state || finishedAt) return;
        const next = engineAward(state, winner);
        const over = winnerOf(next.score, next.target, next.winByTwo) != null;
        set({
            state: next,
            past: [...past, state],
            finishedAt: over ? Date.now() : null,
        });
    },

    undo: () => {
        const { past } = get();
        if (!past.length) return;
        set({ state: past[past.length - 1], past: past.slice(0, -1), finishedAt: null });
    },

    setName: (idx, a, b) =>
        set((s) => {
            if (!s.state) return s;
            const st = s.state;
            let names: MatchState['names'];
            if (st.mode === 'singles') {
                const value = a as string;
                names = (st.names as Pair).map((n, i) => (i === idx ? value : n)) as Pair;
            } else {
                const slot = a as number;
                const value = b as string;
                names = (st.names as DoublesNames).map((tm, ti) =>
                    ti === idx ? (tm.map((p, pi) => (pi === slot ? value : p)) as Pair) : tm
                ) as DoublesNames;
            }

            return { state: { ...st, names } };
        }),

    reset: () => {
        const { state } = get();
        if (!state) return;
        set({
            state: freshState({
                mode: state.mode,
                names: state.names,
                target: state.target,
                winByTwo: state.winByTwo,
            }),
            past: [],
            createdAt: Date.now(),
            finishedAt: null,
        });
    },

    record: () => {
        const { state, createdAt, finishedAt } = get();
        if (!state) return null;
        const winner = winnerOf(state.score, state.target, state.winByTwo);
        if (winner == null) return null;
        const names =
            state.mode === 'singles'
                ? ([...(state.names as Pair)] as Pair)
                : ((state.names as DoublesNames).map((t) => [...t]) as DoublesNames);

        return {
            id: `m${Date.now()}-${++recordSeq}`,
            mode: state.mode,
            names,
            score: [...state.score] as [number, number],
            winner,
            target: state.target,
            durationMs: (finishedAt ?? Date.now()) - createdAt,
            date: Date.now(),
        };
    },
}));

/* ── Live view consumed by the scoreboard ──────────────────────────────── */
export interface MatchView extends CourtView {
    target: Target;
    winByTwo: boolean;
    event: ServeEvent | null;
    winner: TeamIdx | null;
    isOver: boolean;
    pointsPlayed: number;
    createdAt: number;
    finishedAt: number | null;
    canUndo: boolean;
    setName: (idx: number, a: number | string, b?: string) => void;
    award: (winner: TeamIdx) => void;
    undo: () => void;
    reset: () => void;
}

/** Derive the scoreboard view from the live match state. */
export function useMatchView(): MatchView | null {
    const state = useMatchStore((s) => s.state);
    const past = useMatchStore((s) => s.past);
    const createdAt = useMatchStore((s) => s.createdAt);
    const finishedAt = useMatchStore((s) => s.finishedAt);
    const award = useMatchStore((s) => s.award);
    const undo = useMatchStore((s) => s.undo);
    const setName = useMatchStore((s) => s.setName);
    const reset = useMatchStore((s) => s.reset);

    return useMemo(() => {
        if (!state) return null;
        const winner = winnerOf(state.score, state.target, state.winByTwo);

        let servingSide: Court;
        let servingPlayerIdx = 0;
        let servingPlayerName: string;
        if (state.mode === 'singles') {
            servingSide = state.score[state.server] % 2 === 0 ? 'right' : 'left';
            servingPlayerName = (state.names as Pair)[state.server];
        } else {
            const t = state.serverD.team;
            servingSide = state.score[t] % 2 === 0 ? 'right' : 'left';
            servingPlayerIdx = state.positions[t][state.score[t] % 2 === 0 ? 0 : 1];
            servingPlayerName = (state.names as DoublesNames)[t][servingPlayerIdx];
        }

        return {
            mode: state.mode,
            names: state.names,
            score: state.score,
            server: state.server,
            serverD: state.serverD,
            positions: state.positions,
            servingSide,
            servingPlayerIdx,
            servingPlayerName,
            target: state.target,
            winByTwo: state.winByTwo,
            event: state.event,
            winner,
            isOver: winner != null,
            pointsPlayed: state.score[0] + state.score[1],
            createdAt,
            finishedAt,
            canUndo: past.length > 0,
            setName,
            award,
            undo,
            reset,
        };
    }, [state, past.length, createdAt, finishedAt, award, undo, setName, reset]);
}
