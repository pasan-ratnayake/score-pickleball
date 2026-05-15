import { CourtLayout } from '../Components/Score/Layouts/CourtLayout/CourtLayout';
import { SetupScreen } from '../Components/Score/SetupScreen';
import { WinOverlay } from '../Components/Score/Shared/WinOverlay';
import { useDocumentTitle } from '../Hooks/useDocumentTitle';
import { useGameStore } from '../Stores/useGameStore';

/**
 * Score page entry point.
 *
 * Picks the right view (setup vs in-game) and the active layout.
 * Add new layouts by importing them and switching here based on a setting.
 */
export function Score() {
    useDocumentTitle('Pickleball Scorer');
    const phase = useGameStore((s) => s.phase);

    if (phase === 'setup') {
        return <SetupScreen />;
    }

    return (
        <>
            <CourtLayout />
            <WinOverlay />
        </>
    );
}
