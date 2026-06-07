import { Link } from 'react-router';

import { RulesContent } from '../Components/Rules/RulesContent';
import { useDocumentTitle } from '../Hooks/useDocumentTitle';

export function Rules() {
    useDocumentTitle('Pickleball — Rules');

    return (
        <div style={{ minHeight: '100dvh', background: 'var(--clr-bg)', color: 'var(--clr-text)' }}>
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 'max(12px, env(safe-area-inset-top)) 16px 12px',
                    background: 'color-mix(in srgb, var(--clr-bg) 88%, transparent)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid var(--clr-border)',
                }}
            >
                <Link
                    to="/"
                    aria-label="Back"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 38,
                        height: 38,
                        borderRadius: 999,
                        background: 'var(--clr-surface)',
                        border: '1px solid var(--clr-border)',
                        color: 'var(--clr-text)',
                        fontSize: 22,
                        textDecoration: 'none',
                    }}
                >
                    ‹
                </Link>
                <span style={{ fontWeight: 800, fontSize: 17 }}>Rules</span>
            </header>
            <main style={{ maxWidth: 720, margin: '0 auto', padding: '8px 16px 48px' }}>
                <RulesContent />
            </main>
        </div>
    );
}
