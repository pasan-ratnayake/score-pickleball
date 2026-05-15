import { RulesContent } from '../Components/Rules/RulesContent';
import { useDocumentTitle } from '../Hooks/useDocumentTitle';

export function Rules() {
    useDocumentTitle('Pickleball — Rules');

    return <RulesContent />;
}
