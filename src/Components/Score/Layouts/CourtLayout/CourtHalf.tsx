import { useGameStore } from '../../../../Stores/useGameStore';
import type { Team } from '../../../../Types/Game';
import { getDisplayName, getPlayerName } from '../../../../Types/Game';
import { sideToScreen } from '../../../../Utils/scoringEngine';
import { InlineEdit } from '../../Shared/InlineEdit';
import { PlayerSlot } from './PlayerSlot';

interface CourtHalfProps {
    team: Team;
    onScore: () => void;
    /** 'sl' | 'sr' if this team's serving player is on a given screen side. */
    servingScreen: 'sl' | 'sr' | null;
    /** Diagonal receiving box (for visual highlight) when this team is receiving. */
    receivingScreen: 'sl' | 'sr' | null;
}

/**
 * One half of the pickleball court (Team A on top, Team B on the bottom).
 *
 * Tap anywhere in the half = "this team won the rally" (recordPoint).
 * Inline-clickable elements (names) stop propagation so they don't trigger a score.
 */
export function CourtHalf({ team, onScore, servingScreen, receivingScreen }: CourtHalfProps) {
    const state = useGameStore();
    const setName = useGameStore((s) => s.setName);
    const setPlayerName = useGameStore((s) => s.setPlayerName);

    const score = state.scores[team];
    const swapped = score % 2 === 1; // players swapped from starting positions
    const isDoubles = state.format === 'doubles';

    // For doubles: P1 (idx 0) starts in their right court; flip when team's score is odd.
    // For singles: one player, position from own score parity.
    const slotContents: Record<'sl' | 'sr', { visible: boolean; playerIdx: 0 | 1 | null }> = {
        sl: { visible: true, playerIdx: null },
        sr: { visible: true, playerIdx: null },
    };

    if (isDoubles) {
        const p1ScreenPos = sideToScreen(team, swapped ? 'L' : 'R');
        const p2ScreenPos = p1ScreenPos === 'sl' ? 'sr' : 'sl';
        slotContents[p1ScreenPos].playerIdx = 0;
        slotContents[p2ScreenPos].playerIdx = 1;
    } else {
        const playerScreenPos = sideToScreen(team, score % 2 === 0 ? 'R' : 'L');
        const otherPos = playerScreenPos === 'sl' ? 'sr' : 'sl';
        slotContents[otherPos].visible = false;
        // Singles hides the redundant name under the player (team name shows near net).
        slotContents[playerScreenPos].playerIdx = null;
    }

    const teamClass = team === 'A' ? 'court-half-a' : 'court-half-b';
    const tintClass = team === 'A' ? 'team-a-tint' : 'team-b-tint';
    const courtInfoClass = team === 'A' ? 'court-info-a' : 'court-info-b';
    const isServingTeam = servingScreen !== null;

    return (
        <div
            className={`court-half ${teamClass} ${isServingTeam ? 'serving' : ''}`}
            onClick={onScore}
        >
            <div className="court-baseline-row">
                <div
                    className={`service-box ${receivingScreen === 'sl' ? 'receiving-target' : ''}`}
                    data-screen="sl"
                />
                <div
                    className={`service-box ${receivingScreen === 'sr' ? 'receiving-target' : ''}`}
                    data-screen="sr"
                />
            </div>

            <PlayerSlot
                team={team}
                screen="sl"
                visible={slotContents.sl.visible}
                playerIdx={slotContents.sl.playerIdx}
                playerName={
                    slotContents.sl.playerIdx !== null
                        ? getPlayerName(state, team, slotContents.sl.playerIdx)
                        : ''
                }
                isServing={servingScreen === 'sl'}
                showName={isDoubles}
                onRename={(idx, name) => setPlayerName(team, idx, name)}
            />
            <PlayerSlot
                team={team}
                screen="sr"
                visible={slotContents.sr.visible}
                playerIdx={slotContents.sr.playerIdx}
                playerName={
                    slotContents.sr.playerIdx !== null
                        ? getPlayerName(state, team, slotContents.sr.playerIdx)
                        : ''
                }
                isServing={servingScreen === 'sr'}
                showName={isDoubles}
                onRename={(idx, name) => setPlayerName(team, idx, name)}
            />

            <div className={`kitchen kitchen-${team.toLowerCase()}`} />

            <div className={`court-info ${courtInfoClass}`}>
                {team === 'A' ? (
                    <>
                        <InlineEdit
                            value={getDisplayName(state, team)}
                            onCommit={(name) => setName(team, name)}
                            inputClassName="team-name-input"
                            maxLength={20}
                            renderDisplay={({ value, startEdit }) => (
                                <span
                                    className={`court-name ${tintClass}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startEdit();
                                    }}
                                    title="Tap to rename"
                                >
                                    {value}
                                </span>
                            )}
                        />
                        <span className={`court-score ${tintClass}`}>{score}</span>
                    </>
                ) : (
                    <>
                        <span className={`court-score ${tintClass}`}>{score}</span>
                        <InlineEdit
                            value={getDisplayName(state, team)}
                            onCommit={(name) => setName(team, name)}
                            inputClassName="team-name-input"
                            maxLength={20}
                            renderDisplay={({ value, startEdit }) => (
                                <span
                                    className={`court-name ${tintClass}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startEdit();
                                    }}
                                    title="Tap to rename"
                                >
                                    {value}
                                </span>
                            )}
                        />
                    </>
                )}
            </div>

            <div className="tap-hint">+1</div>
        </div>
    );
}
