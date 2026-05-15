import './GameActions.css';

import { useGameStore } from '../../../Stores/useGameStore';

export function GameActions() {
    const canUndo = useGameStore((s) => s.history.length > 0);
    const undo = useGameStore((s) => s.undo);
    const newGame = useGameStore((s) => s.newGame);

    return (
        <div id="game-actions">
            <button
                type="button"
                className="btn-secondary"
                onClick={undo}
                disabled={!canUndo}
            >
                ↩ Undo
            </button>
            <button type="button" className="btn-secondary" onClick={newGame}>
                New Game
            </button>
        </div>
    );
}
