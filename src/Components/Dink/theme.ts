/* theme.ts — Dink design tokens: fonts, the Court-View UI palette (`T`),
 * accent themes, and motion speeds. */

import type { AccentKey, Speed } from '../../Types/Game';

export const BRICO = '"Bricolage Grotesque", "Inter Tight", system-ui, sans-serif';
export const INTER = '"Inter Tight", system-ui, sans-serif';
export const SERIF = '"Fraunces", Georgia, serif';

/** Court-View UI kit tokens (sage canvas, white cards, ink text). */
export const T = {
    bg: '#E7EFE4',
    card: '#FFFFFF',
    ink: '#14181A',
    muted: '#5A6065',
    line: 'rgba(20,24,26,.10)',
    soft: '#F1F5EE',
    display: BRICO,
    body: INTER,
} as const;

/** Live accent, read from the CSS var so it updates instantly with the theme. */
export const accent = 'var(--accent, #2E7D52)';
export const accentInk = 'var(--accent-ink, #fff)';

export interface Palette {
    c: string;
    ink: string;
    label: string;
}

export const PALETTES: Record<AccentKey, Palette> = {
    green: { c: '#2E7D52', ink: '#ffffff', label: 'Court' },
    clay: { c: '#BE4B2B', ink: '#ffffff', label: 'Clay' },
    grape: { c: '#6B4FB0', ink: '#ffffff', label: 'Grape' },
    ocean: { c: '#1F6F8B', ink: '#ffffff', label: 'Ocean' },
};

export const SPEEDS: Record<Speed, number> = { calm: 640, default: 460, snappy: 300 };
