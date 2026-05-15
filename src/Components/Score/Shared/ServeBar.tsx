import './ServeBar.css';

import { useGameStore } from '../../../Stores/useGameStore';
import { getDisplayName, opponent } from '../../../Types/Game';

export function ServeBar() {
    const state = useGameStore();
    const name = getDisplayName(state, state.serving);
    const icon = state.serving === 'A' ? '🔴' : '🔵';

    let text: string;

    if (state.format === 'doubles') {
        const oppScore = state.scores[opponent(state.serving)];
        text = `${name} serving · ${state.scores[state.serving]}–${oppScore}–${state.serverNum}`;
    } else {
        const side = state.scores[state.serving] % 2 === 0 ? 'right' : 'left';
        text = `${name} serving from the ${side}`;
    }

    return (
        <div id="serve-bar">
            <span id="serve-icon">{icon}</span>
            <span id="serve-text">{text}</span>
        </div>
    );
}
