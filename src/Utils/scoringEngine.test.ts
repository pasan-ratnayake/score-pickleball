import { describe, expect, it } from 'vitest';

import type { GameState } from '../Types/Game';
import { applyRally, currentServeSide, sideToScreen } from './scoringEngine';

const baseDoubles = (): GameState => ({
    phase: 'playing',
    format: 'doubles',
    playTo: 11,
    names: { A: 'Team A', B: 'Team B' },
    playerNames: { A: ['', ''], B: ['', ''] },
    scores: { A: 0, B: 0 },
    serving: 'A',
    serverNum: 2, // doubles start with server 2 (one-serve rule)
    serveSide: 'R',
    isFirstServe: true,
    winner: null,
});

const baseSingles = (): GameState => ({
    ...baseDoubles(),
    format: 'singles',
    serverNum: 1,
    isFirstServe: false,
});

describe('applyRally — doubles', () => {
    it('serving team scoring keeps the serve and switches the server side', () => {
        const s1 = applyRally(baseDoubles(), 'A');
        expect(s1.scores).toEqual({ A: 1, B: 0 });
        expect(s1.serving).toBe('A');
        expect(s1.serverNum).toBe(2);
        expect(s1.serveSide).toBe('L');
        expect(s1.isFirstServe).toBe(false);
    });

    it('first-serve loss skips server 2 and hands directly to the other team', () => {
        const s = applyRally(baseDoubles(), 'B');
        expect(s.scores).toEqual({ A: 0, B: 0 });
        expect(s.serving).toBe('B');
        expect(s.serverNum).toBe(1);
        expect(s.serveSide).toBe('R');
        expect(s.isFirstServe).toBe(false);
    });

    it('after first serve, server 1 loss promotes partner to server 2', () => {
        // Set up: B is serving as S1 (e.g. after first-serve loss), then loses a rally.
        const s: GameState = { ...baseDoubles(), serving: 'B', serverNum: 1, serveSide: 'R', isFirstServe: false };
        const s2 = applyRally(s, 'A');
        expect(s2.serving).toBe('B');
        expect(s2.serverNum).toBe(2);
        expect(s2.serveSide).toBe('L');
        expect(s2.scores).toEqual({ A: 0, B: 0 });
    });

    it('after first serve, server 2 loss rotates to opponent server 1', () => {
        const s: GameState = { ...baseDoubles(), serving: 'B', serverNum: 2, serveSide: 'L', isFirstServe: false };
        const s2 = applyRally(s, 'A');
        expect(s2.serving).toBe('A');
        expect(s2.serverNum).toBe(1);
        expect(s2.serveSide).toBe('R');
    });
});

describe('applyRally — singles', () => {
    it('server scoring increments score and keeps serve', () => {
        const s = applyRally(baseSingles(), 'A');
        expect(s.scores).toEqual({ A: 1, B: 0 });
        expect(s.serving).toBe('A');
    });

    it('server losing the rally hands serve to opponent without scoring', () => {
        const s = applyRally(baseSingles(), 'B');
        expect(s.scores).toEqual({ A: 0, B: 0 });
        expect(s.serving).toBe('B');
    });
});

describe('applyRally — win detection', () => {
    it('reaches winner when leading by 2 at playTo', () => {
        const s: GameState = { ...baseDoubles(), scores: { A: 10, B: 5 }, isFirstServe: false };
        const s2 = applyRally(s, 'A');
        expect(s2.scores.A).toBe(11);
        expect(s2.winner).toBe('A');
        expect(s2.phase).toBe('ended');
    });

    it('does not declare a winner at 11–10 (must win by 2)', () => {
        const s: GameState = { ...baseDoubles(), scores: { A: 10, B: 10 }, isFirstServe: false };
        const s2 = applyRally(s, 'A');
        expect(s2.scores.A).toBe(11);
        expect(s2.winner).toBeNull();
        expect(s2.phase).toBe('playing');
    });

    it('declares a winner at 12–10', () => {
        const s: GameState = { ...baseDoubles(), scores: { A: 11, B: 10 }, isFirstServe: false };
        const s2 = applyRally(s, 'A');
        expect(s2.scores.A).toBe(12);
        expect(s2.winner).toBe('A');
    });
});

describe('applyRally — guards', () => {
    it('returns the same state when phase is not playing', () => {
        const s: GameState = { ...baseDoubles(), phase: 'ended', winner: 'A' };
        const s2 = applyRally(s, 'B');
        expect(s2).toBe(s);
    });
});

describe('currentServeSide', () => {
    it('uses serveSide directly in doubles', () => {
        const s: GameState = { ...baseDoubles(), serveSide: 'L' };
        expect(currentServeSide(s)).toBe('L');
    });

    it('derives from score parity in singles', () => {
        const evenScore: GameState = { ...baseSingles(), scores: { A: 4, B: 1 } };
        const oddScore: GameState = { ...baseSingles(), scores: { A: 3, B: 1 } };
        expect(currentServeSide(evenScore)).toBe('R');
        expect(currentServeSide(oddScore)).toBe('L');
    });
});

describe('sideToScreen', () => {
    it("mirrors team A vs team B because they face each other", () => {
        expect(sideToScreen('A', 'R')).toBe('sr');
        expect(sideToScreen('A', 'L')).toBe('sl');
        expect(sideToScreen('B', 'R')).toBe('sl');
        expect(sideToScreen('B', 'L')).toBe('sr');
    });
});
