export type Team = 'A' | 'B';
export type Format = 'singles' | 'doubles';
export type PlayTo = 11 | 21;
export type ServeSide = 'R' | 'L';
export type ServerNum = 1 | 2;
export type Phase = 'setup' | 'playing' | 'ended';

export interface GameState {
    phase: Phase;
    format: Format;
    playTo: PlayTo;
    names: Record<Team, string>;
    /** Doubles only — index 0 = P1, 1 = P2 (the player who started in the right court is P1) */
    playerNames: Record<Team, [string, string]>;
    scores: Record<Team, number>;
    serving: Team;
    serverNum: ServerNum;
    /** Side from the serving player's perspective (doubles only). */
    serveSide: ServeSide;
    /** True until the very first rally of the game ends — used for the "0-0-2" rule. */
    isFirstServe: boolean;
    winner: Team | null;
}

export const opponent = (team: Team): Team => (team === 'A' ? 'B' : 'A');

export const defaultName = (team: Team, format: Format): string =>
    format === 'doubles' ? `Team ${team}` : `Player ${team}`;

export const getDisplayName = (state: Pick<GameState, 'names' | 'format'>, team: Team): string =>
    state.names[team] || defaultName(team, state.format);

export const getPlayerName = (
    state: Pick<GameState, 'playerNames'>,
    team: Team,
    idx: 0 | 1
): string => state.playerNames[team][idx] || `P${idx + 1}`;
