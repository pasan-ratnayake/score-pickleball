import { Link } from 'react-router';

import { useDocumentTitle } from '../Hooks/useDocumentTitle';

export function NotFound() {
    useDocumentTitle('Pickleball Scorer — Not Found');

    return (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--clr-text)' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: 12 }}>404</h1>
            <p style={{ color: 'var(--clr-muted)', marginBottom: 16 }}>
                That page doesn&rsquo;t exist.
            </p>
            <Link to="/score" style={{ color: 'var(--clr-primary)', fontWeight: 700 }}>
                Back to Score
            </Link>
        </div>
    );
}
