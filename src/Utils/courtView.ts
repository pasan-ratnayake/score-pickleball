/* courtView.ts — pure view helpers for the court scoreboard.
 *
 * They derive callout strings and court placement (which player sits in which
 * service court, where the server paddle goes) from a CourtView. Singles places
 * BOTH players by the SERVER's score parity; doubles uses explicit positions. */

import type {
    Court,
    DoublesNames,
    DoublesServer,
    Mode,
    Pair,
    Positions,
    ServeEvent,
    TeamIdx,
} from '../Types/Game';

/** The minimal shape the court helpers read (a subset of the live match view). */
export interface CourtView {
    mode: Mode;
    names: Pair | DoublesNames;
    score: [number, number];
    /** Singles server index. */
    server: TeamIdx;
    /** Doubles server. */
    serverD: DoublesServer;
    /** Doubles court positions per team: [rightCourtIdx, leftCourtIdx]. */
    positions: Positions;
    servingSide: Court;
    /** Doubles only. */
    servingPlayerIdx: number;
    servingPlayerName: string;
}

const EN = '–';

/* ── Singles ───────────────────────────────────────────────────────────── */
export const singlesCallout = (m: CourtView): string =>
    `${m.score[m.server]}${EN}${m.score[1 - m.server]}`;

export const singlesCalloutLong = (m: CourtView): string =>
    `${singlesCallout(m)} · ${(m.names as Pair)[m.server]} serving · ${m.servingSide} court`;

/** The server sits right court on an even score, left on odd. */
export const singlesP0OnRight = (m: CourtView): boolean => m.score[m.server] % 2 === 0;

/** Whether the given team's player is on the (screen) right; receiver mirrors. */
export const singlesPOnRight = (m: CourtView, team: TeamIdx): boolean =>
    team === 0 ? singlesP0OnRight(m) : !singlesP0OnRight(m);

/* ── Doubles ───────────────────────────────────────────────────────────── */
export const calloutString = (m: CourtView): string =>
    `${m.score[m.serverD.team]}${EN}${m.score[1 - m.serverD.team]}${EN}${m.serverD.number}`;

export const calloutLong = (m: CourtView): string =>
    `${calloutString(m)} · ${m.servingPlayerName} serving · ${m.servingSide} court`;

export interface Slot {
    name: string;
    idx: number;
    court: Court;
    isServer: boolean;
}

/** Returns the two slots for a team as [screen-left, screen-right]. */
export function teamRow(m: CourtView, team: TeamIdx, mirrorTop = true): [Slot, Slot] {
    const [rIdx, lIdx] = m.positions[team];
    const names = (m.names as DoublesNames)[team];
    const isServ = (court: Court): boolean => m.serverD.team === team && m.servingSide === court;
    const slot = (idx: number, court: Court): Slot => ({
        name: names[idx],
        idx,
        court,
        isServer: isServ(court),
    });
    if (team === 0 || !mirrorTop) return [slot(lIdx, 'left'), slot(rIdx, 'right')];

    return [slot(rIdx, 'right'), slot(lIdx, 'left')];
}

/* ── Which quadrant the server token occupies ──────────────────────────── */
export interface ServeCell {
    team: TeamIdx;
    cellRight: boolean;
    slot?: Slot;
    align?: Court;
}

export const singlesServeCell = (m: CourtView): ServeCell => ({
    team: m.server,
    cellRight: singlesPOnRight(m, m.server),
});

export const doublesServeCell = (m: CourtView): ServeCell => {
    const team = m.serverD.team;
    const [a, b] = teamRow(m, team);
    const cellRight = !!b.isServer;

    return { team, cellRight, slot: cellRight ? b : a, align: cellRight ? 'right' : 'left' };
};

/* ── Announce-banner copy from a serve event ───────────────────────────── */
export interface AnnounceCopy {
    title: string;
    body: string;
    team: TeamIdx;
}

export function announceFromEvent(ev: ServeEvent | null): AnnounceCopy | null {
    if (!ev || ev.kind === 'point' || ev.over) return null;
    if (ev.kind === 'second') return { title: 'Service change', body: 'Second server', team: ev.team };

    return { title: 'Side out', body: `${ev.name} serves`, team: ev.team };
}
