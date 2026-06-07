/* Play.tsx — thin live-match screen: reads the match view, renders the board. */

import { useMatchView } from '../../../Stores/useMatchStore';
import { Scoreboard } from '../Scoreboard';
import type { Skin } from '../skins';

interface PlayScreenProps {
    skin: Skin;
    flipMs: number;
    onExit: () => void;
    onNewMatch: () => void;
    onFinish: () => void;
}
export function PlayScreen({ skin, flipMs, onExit, onNewMatch, onFinish }: PlayScreenProps) {
    const m = useMatchView();
    if (!m) return null;

    return (
        <Scoreboard
            m={m}
            skin={skin}
            flipMs={flipMs}
            onExit={onExit}
            onNewMatch={onNewMatch}
            onFinish={onFinish}
        />
    );
}
