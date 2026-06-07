/* roster.ts — pure player-catalogue helpers for setup autocomplete.
 *
 * The roster is a recency- + frequency-ranked list of every real player name
 * typed into a match. Generic placeholder names are never catalogued. */

import type { MatchNames, RosterEntry } from '../Types/Game';

const SKIP = new Set(['opponent', 'partner', 'player 1', 'player 2', 'player', '']);

/** Flatten singles/doubles names into a flat list of strings. */
export function flattenNames(names: MatchNames): string[] {
    const out: string[] = [];
    (names as unknown[]).forEach((x) => {
        if (Array.isArray(x)) x.forEach((n) => out.push(n as string));
        else out.push(x as string);
    });

    return out;
}

/** Fold a set of names into the roster, bumping recency + frequency. Returns a new list. */
export function foldRoster(roster: RosterEntry[], names: MatchNames, now: number): RosterEntry[] {
    const list = roster.map((p) => ({ ...p }));
    flattenNames(names).forEach((raw) => {
        const name = (raw || '').trim();
        const key = name.toLowerCase();
        if (!name || SKIP.has(key)) return;
        const ex = list.find((p) => p.name.toLowerCase() === key);
        if (ex) {
            ex.n = (ex.n || 1) + 1;
            ex.at = now;
            ex.name = name;
        } else {
            list.push({ name, n: 1, at: now });
        }
    });
    list.sort((a, b) => b.at - a.at || b.n - a.n);

    return list.slice(0, 80);
}

/**
 * Suggestions for a partially-typed name. `exclude` removes names already chosen
 * elsewhere in the current match. Prefix matches rank above substring matches.
 */
export function rosterSuggestions(
    roster: RosterEntry[],
    query: string,
    exclude: string[] = [],
    limit = 6
): string[] {
    const q = (query || '').trim().toLowerCase();
    const ex = new Set(
        exclude.map((x) => (x || '').trim().toLowerCase()).filter(Boolean)
    );
    const list = roster.filter((p) => {
        const k = p.name.toLowerCase();
        if (ex.has(k)) return false;
        if (k === q) return false; // already exactly typed

        return !q || k.includes(q);
    });
    list.sort((a, b) => {
        const ap = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bp = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        if (ap !== bp) return ap - bp;

        return b.at - a.at || b.n - a.n;
    });

    return list.slice(0, limit).map((p) => p.name);
}
