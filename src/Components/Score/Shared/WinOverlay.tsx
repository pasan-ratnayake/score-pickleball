import './WinOverlay.css';

import { useGameStore } from '../../../Stores/useGameStore';
import { getDisplayName } from '../../../Types/Game';

export function WinOverlay() {
    const state = useGameStore();

    if (state.phase !== 'ended' || !state.winner) {
        return null;
    }

    const winner = state.winner;
    const name = getDisplayName(state, winner);
    const color = winner === 'A' ? 'var(--clr-team-a)' : 'var(--clr-team-b)';

    return (
        <div id="win-overlay">
            <div id="win-card">
                <div id="win-emoji">🏆</div>
                <div id="win-team-name" style={{ color }}>
                    {name}
                </div>
                <div id="win-message">Wins!</div>
                <div id="win-score-display">
                    {state.scores.A} – {state.scores.B}
                </div>
                <button type="button" className="btn-primary" onClick={state.playAgain}>
                    Play Again
                </button>
                <button type="button" className="btn-secondary" onClick={state.newGame}>
                    New Game
                </button>
            </div>
        </div>
    );
}
