import { create } from 'zustand';

import type { Format, GameState, PlayTo, Team } from '../Types/Game';
import { defaultName } from '../Types/Game';
import { applyRally } from '../Utils/scoringEngine';

const initialState = (): GameState => ({
    phase: 'setup',
    format: 'doubles',
    playTo: 11,
    names: { A: '', B: '' },
    playerNames: { A: ['', ''], B: ['', ''] },
    scores: { A: 0, B: 0 },
    serving: 'A',
    serverNum: 2, // doubles starts with server 2 (one-serve rule)
    serveSide: 'R',
    isFirstServe: true,
    winner: null,
});

interface GameStore extends GameState {
    /** Snapshots of GameState before each rally — used for undo. */
    history: GameState[];

    setFormat: (format: Format) => void;
    setPlayTo: (playTo: PlayTo) => void;
    setName: (team: Team, name: string) => void;
    setPlayerName: (team: Team, idx: 0 | 1, name: string) => void;

    startGame: () => void;
    recordPoint: (rallyWinner: Team) => void;
    undo: () => void;
    /** Reset scores/serve but keep names + format (used by "Play Again"). */
    playAgain: () => void;
    /** Full reset back to setup screen. */
    newGame: () => void;
}

const stripStore = (s: GameStore): GameState => ({
    phase: s.phase,
    format: s.format,
    playTo: s.playTo,
    names: s.names,
    playerNames: s.playerNames,
    scores: s.scores,
    serving: s.serving,
    serverNum: s.serverNum,
    serveSide: s.serveSide,
    isFirstServe: s.isFirstServe,
    winner: s.winner,
});

export const useGameStore = create<GameStore>((set, get) => ({
    ...initialState(),
    history: [],

    setFormat: (format) => set({ format }),
    setPlayTo: (playTo) => set({ playTo }),

    setName: (team, name) =>
        set((state) => ({
            names: {
                ...state.names,
                [team]: name.trim() || defaultName(team, state.format),
            },
        })),

    setPlayerName: (team, idx, name) =>
        set((state) => {
            const next = [...state.playerNames[team]] as [string, string];
            next[idx] = name.trim();

            return { playerNames: { ...state.playerNames, [team]: next } };
        }),

    startGame: () => {
        const s = get();

        set({
            phase: 'playing',
            scores: { A: 0, B: 0 },
            serving: 'A',
            serverNum: 2,
            serveSide: 'R',
            isFirstServe: true,
            winner: null,
            history: [],
            // Fill in default names if blank.
            names: {
                A: s.names.A || defaultName('A', s.format),
                B: s.names.B || defaultName('B', s.format),
            },
        });
    },

    recordPoint: (rallyWinner) => {
        const s = get();

        if (s.phase !== 'playing') {
            return;
        }

        const snapshot = stripStore(s);
        const next = applyRally(snapshot, rallyWinner);

        set({
            ...next,
            history: [...s.history, snapshot],
        });
    },

    undo: () => {
        const { history } = get();

        if (history.length === 0) {
            return;
        }

        const previous = history[history.length - 1];

        set({
            ...previous,
            history: history.slice(0, -1),
        });
    },

    playAgain: () => {
        set({
            phase: 'playing',
            scores: { A: 0, B: 0 },
            serving: 'A',
            serverNum: 2,
            serveSide: 'R',
            isFirstServe: true,
            winner: null,
            history: [],
        });
    },

    newGame: () => {
        set({ ...initialState(), history: [] });
    },
}));
