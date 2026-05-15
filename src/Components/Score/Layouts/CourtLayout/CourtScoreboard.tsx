import { useGameStore } from '../../../../Stores/useGameStore';
import type { Team } from '../../../../Types/Game';
import { currentServeSide, sideToScreen } from '../../../../Utils/scoringEngine';
import { CourtHalf } from './CourtHalf';

interface CourtScoreboardProps {
    onScore: (team: Team) => void;
}

export function CourtScoreboard({ onScore }: CourtScoreboardProps) {
    const state = useGameStore();
    const serveSide = currentServeSide(state);
    const servingScreen = sideToScreen(state.serving, serveSide);
    const targetScreen = servingScreen === 'sl' ? 'sr' : 'sl';

    return (
        <div id="court-scoreboard">
            <CourtHalf
                team="A"
                onScore={() => onScore('A')}
                servingScreen={state.serving === 'A' ? servingScreen : null}
                receivingScreen={state.serving === 'B' ? targetScreen : null}
            />

            <div className="net-line">
                <span className="net-label">Net</span>
            </div>

            <CourtHalf
                team="B"
                onScore={() => onScore('B')}
                servingScreen={state.serving === 'B' ? servingScreen : null}
                receivingScreen={state.serving === 'A' ? targetScreen : null}
            />
        </div>
    );
}
