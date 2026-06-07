import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { MatchNames, MatchRecord, RosterEntry } from '../Types/Game';
import { foldRoster } from '../Utils/roster';

interface HistoryStore {
    matches: MatchRecord[];
    roster: RosterEntry[];
    /** Record a finished match (also folds its players into the roster). */
    addMatch: (rec: MatchRecord) => void;
    clearMatches: () => void;
    /** Fold a set of names into the roster (used when starting a match). */
    rememberPlayers: (names: MatchNames) => void;
    /** One-time backfill of the roster from past matches (oldest first). */
    seedRoster: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
    persist(
        (set, get) => ({
            matches: [],
            roster: [],

            addMatch: (rec) =>
                set((s) => ({
                    matches: [rec, ...s.matches].slice(0, 50),
                    roster: foldRoster(s.roster, rec.names, Date.now()),
                })),

            clearMatches: () => set({ matches: [] }),

            rememberPlayers: (names) =>
                set((s) => ({ roster: foldRoster(s.roster, names, Date.now()) })),

            seedRoster: () => {
                const { roster, matches } = get();
                if (roster.length) return;
                let next: RosterEntry[] = [];
                // Oldest first so recency builds up correctly.
                [...matches].reverse().forEach((r) => {
                    next = foldRoster(next, r.names, r.date);
                });
                set({ roster: next });
            },
        }),
        { name: 'dink-history-v1' }
    )
);
