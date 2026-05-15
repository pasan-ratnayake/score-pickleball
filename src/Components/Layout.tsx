import './Layout.css';

import { NavLink } from 'react-router';

import { useThemeStore } from '../Stores/useThemeStore';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const theme = useThemeStore((s) => s.theme);
    const toggle = useThemeStore((s) => s.toggle);

    return (
        <div id="app">
            <nav id="tab-bar">
                <NavLink
                    to="/score"
                    className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
                >
                    🏓 Score
                </NavLink>
                <NavLink
                    to="/rules"
                    className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
                >
                    📖 Rules
                </NavLink>
                <button
                    id="theme-toggle"
                    type="button"
                    onClick={toggle}
                    aria-label="Toggle dark mode"
                >
                    {theme === 'dark' ? '🌙' : '☀️'}
                </button>
            </nav>

            <main className="tab-panel">{children}</main>
        </div>
    );
}
