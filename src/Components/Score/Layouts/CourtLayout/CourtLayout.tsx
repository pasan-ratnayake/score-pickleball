import './CourtLayout.css';

import { useGameStore } from '../../../../Stores/useGameStore';
import { GameActions } from '../../Shared/GameActions';
import { ScoreLog } from '../../Shared/ScoreLog';
import { ServeBar } from '../../Shared/ServeBar';
import { CourtScoreboard } from './CourtScoreboard';

export function CourtLayout() {
    const recordPoint = useGameStore((s) => s.recordPoint);

    return (
        <div id="screen-game">
            <CourtScoreboard onScore={recordPoint} />
            <ServeBar />
            <GameActions />
            <ScoreLog />
        </div>
    );
}
