import type { Format, GameState, ServerNum, Team } from '../Types/Game';
import { getDisplayName } from '../Types/Game';

export interface LogEntry {
    index: number;
    rallyWinner: Team;
    winnerName: string;
    scoreAfter: Record<Team, number>;
    servingAfter: Team;
    servingAfterName: string;
    serverNumAfter: ServerNum;
    format: Format;
}

/**
 * Derive a chronological log of every rally from the snapshot history + the current state.
 * Returns oldest-first.
 */
export function deriveLog(history: GameState[], current: GameState): LogEntry[] {
    const out: LogEntry[] = [];

    for (let i = 0; i < history.length; i++) {
        const before = history[i];
        const after = i + 1 < history.length ? history[i + 1] : current;

        let rallyWinner: Team;

        if (after.scores.A > before.scores.A) {
            rallyWinner = 'A';
        } else if (after.scores.B > before.scores.B) {
            rallyWinner = 'B';
        } else {
            // No score change — receiver of the previous rally won (they're now serving).
            rallyWinner = after.serving;
        }

        out.push({
            index: i,
            rallyWinner,
            winnerName: getDisplayName(after, rallyWinner),
            scoreAfter: after.scores,
            servingAfter: after.serving,
            servingAfterName: getDisplayName(after, after.serving),
            serverNumAfter: after.serverNum,
            format: after.format,
        });
    }

    return out;
}
