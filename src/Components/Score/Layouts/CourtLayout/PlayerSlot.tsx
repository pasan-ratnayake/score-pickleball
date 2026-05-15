import type { Team } from '../../../../Types/Game';
import { InlineEdit } from '../../Shared/InlineEdit';

interface PlayerSlotProps {
    team: Team;
    screen: 'sl' | 'sr';
    visible: boolean;
    /** null = no player (singles, hidden slot) */
    playerIdx: 0 | 1 | null;
    playerName: string;
    isServing: boolean;
    showName: boolean;
    onRename: (idx: 0 | 1, name: string) => void;
}

export function PlayerSlot({
    team,
    screen,
    visible,
    playerIdx,
    playerName,
    isServing,
    showName,
    onRename,
}: PlayerSlotProps) {
    if (!visible) {
        return null;
    }

    return (
        <div className="player-slot" data-screen={screen}>
            <div className={`player-token ${isServing ? 'serving' : ''}`} data-team={team}>
                <svg className="player-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="6" r="3" />
                    <path d="M12 11c-3.6 0-6.5 2-6.5 5v6h13v-6c0-3-2.9-5-6.5-5z" />
                </svg>
            </div>

            {showName && playerIdx !== null && (
                <InlineEdit
                    value={playerName}
                    onCommit={(name) => onRename(playerIdx, name)}
                    inputClassName="player-name-input"
                    maxLength={16}
                    renderDisplay={({ value, startEdit }) => (
                        <div
                            className="player-name"
                            onClick={(e) => {
                                e.stopPropagation();
                                startEdit();
                            }}
                            title="Tap to rename"
                        >
                            {value}
                        </div>
                    )}
                />
            )}
        </div>
    );
}
