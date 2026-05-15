import './ScoreLog.css';

import { useGameStore } from '../../../Stores/useGameStore';
import { deriveLog } from '../../../Utils/scoreLog';

export function ScoreLog() {
    // Full-store subscription is fine here — the log re-renders whenever the game state
    // changes anyway. Avoids the object-literal selector trap that causes infinite renders.
    const state = useGameStore();
    const entries = deriveLog(state.history, state);
    const count = entries.length;
    const reversed = [...entries].reverse(); // newest first

    return (
        <details id="score-log-container">
            <summary id="log-summary">
                Score Log{' '}
                <span id="log-count">
                    ({count} {count === 1 ? 'event' : 'events'})
                </span>
            </summary>
            <ol id="score-log">
                {reversed.map((e) => (
                    <li key={e.index}>
                        <span
                            className={`log-rally ${e.rallyWinner === 'A' ? 'log-team-a' : 'log-team-b'}`}
                        >
                            {e.winnerName} wins rally
                        </span>
                        <span className="log-score">
                            {e.scoreAfter.A}–{e.scoreAfter.B}
                        </span>
                        <span className="log-serve">
                            {e.format === 'doubles'
                                ? `${e.servingAfterName} S${e.serverNumAfter}`
                                : `${e.servingAfterName} serves`}
                        </span>
                    </li>
                ))}
            </ol>
        </details>
    );
}
