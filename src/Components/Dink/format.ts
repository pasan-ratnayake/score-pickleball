/* format.ts — small display formatters for the Dink screens. */

import type { DoublesNames, MatchRecord, Pair, TeamIdx } from '../../Types/Game';

export function fmtDate(ts: number): string {
    const d = new Date(ts);
    const now = new Date();
    const day = 86400000;
    const a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.round((b.getTime() - a.getTime()) / day);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });

    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function fmtDur(ms: number): string {
    const min = Math.max(1, Math.round(ms / 60000));

    return min < 60 ? `${min} min` : `${Math.floor(min / 60)}h ${min % 60}m`;
}

export function recName(rec: MatchRecord, team: TeamIdx): string {
    return rec.mode === 'singles'
        ? (rec.names as Pair)[team]
        : (rec.names as DoublesNames)[team].join(' & ');
}
