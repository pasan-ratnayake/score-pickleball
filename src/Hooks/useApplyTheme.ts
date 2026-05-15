import { useEffect } from 'react';

import { useThemeStore } from '../Stores/useThemeStore';

/**
 * Apply the current theme to <html data-theme> and the iOS-style theme-color meta.
 * Mount once at the app root.
 */
export function useApplyTheme(): void {
    const theme = useThemeStore((s) => s.theme);

    useEffect(() => {
        const isDark = theme === 'dark';
        document.documentElement.dataset.theme = isDark ? 'dark' : '';
        const meta = document.getElementById('meta-theme-color') as HTMLMetaElement | null;

        if (meta) {
            meta.content = isDark ? '#0D1829' : '#F0F5FF';
        }
    }, [theme]);
}
