import { describe, expect, it } from 'vitest';

import type { DoublesNames, MatchConfig, MatchState, Pair } from '../Types/Game';
import { award, freshState, serverNameOf, winnerOf } from './scoringEngine';

const singlesConfig = (over: Partial<MatchConfig> = {}): MatchConfig => ({
    mode: 'singles',
    names: ['You', 'Riley'] as Pair,
    target: 11,
    winByTwo: true,
    ...over,
});

const doublesConfig = (over: Partial<MatchConfig> = {}): MatchConfig => ({
    mode: 'doubles',
    names: [
        ['You', 'Sam'],
        ['Theo', 'Mara'],
    ] as DoublesNames,
    target: 11,
    winByTwo: true,
    ...over,
});

describe('winnerOf', () => {
    it('returns null below target', () => {
        expect(winnerOf([10, 8], 11, true)).toBeNull();
    });

    it('requires a 2-point lead when winByTwo', () => {
        expect(winnerOf([11, 10], 11, true)).toBeNull();
        expect(winnerOf([12, 10], 11, true)).toBe(0);
        expect(winnerOf([10, 12], 11, true)).toBe(1);
    });

    it('ignores the 2-point rule when winByTwo is off', () => {
        expect(winnerOf([11, 10], 11, false)).toBe(0);
    });
});

describe('award — singles', () => {
    it('server scoring increments and keeps the serve', () => {
        const s = award(freshState(singlesConfig()), 0);
        expect(s.score).toEqual([1, 0]);
        expect(s.server).toBe(0);
        expect(s.event?.kind).toBe('point');
    });

    it('server losing hands the serve over without scoring (side-out)', () => {
        const s = award(freshState(singlesConfig()), 1);
        expect(s.score).toEqual([0, 0]);
        expect(s.server).toBe(1);
        expect(s.event?.kind).toBe('sideout');
        expect(s.event?.name).toBe('Riley');
    });
});

describe('award — doubles', () => {
    it('starts with the 0-0-2 first-service rule', () => {
        const s = freshState(doublesConfig());
        expect(s.serverD).toEqual({ team: 0, number: 2 });
        expect(s.serverPlayer).toBe(0);
        expect(s.isFirstService).toBe(true);
    });

    it('serving team scoring keeps the serve and swaps that team positions', () => {
        const s = award(freshState(doublesConfig()), 0);
        expect(s.score).toEqual([1, 0]);
        expect(s.serverD).toEqual({ team: 0, number: 2 });
        expect(s.positions[0]).toEqual([1, 0]);
        expect(s.isFirstService).toBe(false);
        expect(s.event?.kind).toBe('point');
    });

    it('first-service loss hands directly to the other team server 1', () => {
        const s = award(freshState(doublesConfig()), 1);
        expect(s.score).toEqual([0, 0]);
        expect(s.serverD).toEqual({ team: 1, number: 1 });
        expect(s.isFirstService).toBe(false);
        expect(s.event?.kind).toBe('sideout');
    });

    it('server 1 loss hands the serve to the PARTNER as server 2', () => {
        const start: MatchState = {
            ...freshState(doublesConfig()),
            serverD: { team: 1, number: 1 },
            serverPlayer: 0, // Theo serving
            isFirstService: false,
        };
        const s = award(start, 0);
        expect(s.serverD).toEqual({ team: 1, number: 2 });
        expect(s.serverPlayer).toBe(1); // the partner, Mara, now serves
        expect(s.event?.kind).toBe('second');
        expect(s.event?.name).toBe('Mara');
    });

    it('after first service, server 2 loss rotates to the opponent server 1', () => {
        const start: MatchState = {
            ...freshState(doublesConfig()),
            serverD: { team: 1, number: 2 },
            serverPlayer: 1,
            isFirstService: false,
        };
        const s = award(start, 0);
        expect(s.serverD).toEqual({ team: 0, number: 1 });
        // Incoming server is team 0's right-court player at even score → You (idx 0).
        expect(s.serverPlayer).toBe(0);
        expect(s.event?.kind).toBe('sideout');
        expect(s.event?.name).toBe('You');
    });

    it('each team gets two servers across a full service rotation', () => {
        // Team 1 serving, server 1 = Theo (idx 0). Walk server1 → server2 → side-out.
        let s: MatchState = {
            ...freshState(doublesConfig()),
            serverD: { team: 1, number: 1 },
            serverPlayer: 0,
            isFirstService: false,
        };
        expect(serverNameOf(s)).toBe('Theo');
        s = award(s, 0); // Theo (server 1) loses → Mara serves as server 2
        expect(serverNameOf(s)).toBe('Mara');
        expect(s.serverD.number).toBe(2);
        s = award(s, 0); // Mara (server 2) loses → side-out to team 0
        expect(s.serverD.team).toBe(0);
        expect(s.serverD.number).toBe(1);
    });
});

describe('award — win detection + event', () => {
    it('flags the game over on the winning point', () => {
        const start: MatchState = { ...freshState(singlesConfig()), score: [10, 5] };
        const s = award(start, 0);
        expect(s.score).toEqual([11, 5]);
        expect(winnerOf(s.score, s.target, s.winByTwo)).toBe(0);
        expect(s.event?.over).toBe(true);
    });

    it('does not end the game at 11–10', () => {
        const start: MatchState = { ...freshState(singlesConfig()), score: [10, 10] };
        const s = award(start, 0);
        expect(winnerOf(s.score, s.target, s.winByTwo)).toBeNull();
        expect(s.event?.over).toBe(false);
    });
});

describe('serverNameOf', () => {
    it('reads the singles server name', () => {
        expect(serverNameOf(freshState(singlesConfig()))).toBe('You');
    });

    it('reads the doubles server from serverPlayer', () => {
        expect(serverNameOf(freshState(doublesConfig()))).toBe('You');
    });
});
