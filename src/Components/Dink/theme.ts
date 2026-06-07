/* theme.ts — Dink design tokens: fonts, the app-shell palette (`T`), accent
 * themes, per-Court-Style app themes, and motion speeds.
 *
 * The Court Style IS the theme: it re-skins the whole app, not just the board.
 * `DinkApp` writes the chosen style's tokens to `--app-*` / `--accent` CSS vars;
 * `T` reads them back (with fallbacks) so every screen re-themes live. */

import type { AccentKey, PaperAccentKey, SkinId } from '../../Types/Game';

export const BRICO = '"Bricolage Grotesque", "Inter Tight", system-ui, sans-serif';
export const INTER = '"Inter Tight", system-ui, sans-serif';
export const SERIF = '"Fraunces", Georgia, serif';

/** App-shell UI tokens — CSS-var-backed so the whole app re-themes per style. */
export const T = {
    bg: 'var(--app-bg, #E7EFE4)',
    card: 'var(--app-card, #FFFFFF)',
    ink: 'var(--app-ink, #14181A)',
    muted: 'var(--app-muted, #5A6065)',
    line: 'var(--app-line, rgba(20,24,26,.10))',
    soft: 'var(--app-soft, #F1F5EE)',
    celebrate: 'var(--app-celebrate, #14181A)',
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

/** Court-style accents (the sporty four). */
export const PALETTES: Record<AccentKey, Palette> = {
    green: { c: '#2E7D52', ink: '#ffffff', label: 'Court' },
    clay: { c: '#BE4B2B', ink: '#ffffff', label: 'Clay' },
    grape: { c: '#6B4FB0', ink: '#ffffff', label: 'Grape' },
    ocean: { c: '#1F6F8B', ink: '#ffffff', label: 'Ocean' },
};

/** Paper-style accents (earthy ink-on-cream). */
export const PAPER_PALETTES: Record<PaperAccentKey, Palette> = {
    rust: { c: '#9C4A2A', ink: '#FBF6EA', label: 'Rust' },
    pine: { c: '#3E5C3A', ink: '#FBF6EA', label: 'Pine' },
    navy: { c: '#2F3E63', ink: '#FBF6EA', label: 'Navy' },
    plum: { c: '#6E3A52', ink: '#FBF6EA', label: 'Plum' },
};

/** Styles whose accent the user picks, and the palette they pick from. */
export const ACCENT_PICKERS: Partial<Record<SkinId, Record<string, Palette>>> = {
    court: PALETTES,
    paper: PAPER_PALETTES,
};

/** Styles with a locked-in accent (no picker). */
export const FIXED_ACCENTS: Partial<Record<SkinId, { c: string; ink: string }>> = {
    broadcast: { c: '#A6FF00', ink: '#0A0B0E' },
    glass: { c: '#FFFFFF', ink: '#1A0B3D' },
    split: { c: '#FFD43B', ink: '#0B5752' },
};

export interface AppTheme {
    bg: string;
    card: string;
    ink: string;
    muted: string;
    line: string;
    soft: string;
    frame: string;
    celebrate: string;
    blur: string;
}

/** App-shell theme per Court Style — drives the whole UI, not just the board. */
export const APP_THEMES: Record<SkinId, AppTheme> = {
    court: {
        bg: '#E7EFE4', card: '#FFFFFF', ink: '#14181A', muted: '#5A6065',
        line: 'rgba(20,24,26,.10)', soft: '#F1F5EE', frame: '#DBDDD7',
        celebrate: '#14181A', blur: 'none',
    },
    broadcast: {
        bg: '#0A0B0E', card: '#15191F', ink: '#FFFFFF', muted: 'rgba(255,255,255,.56)',
        line: 'rgba(255,255,255,.12)', soft: '#1B212B', frame: '#000000',
        celebrate: '#0A0B0E', blur: 'none',
    },
    glass: {
        bg: 'linear-gradient(160deg,#1A0B3D 0%,#3D1170 32%,#7C1D6F 62%,#B83270 100%)',
        card: 'rgba(20,9,46,.46)', ink: '#FFFFFF', muted: 'rgba(255,255,255,.72)',
        line: 'rgba(255,255,255,.20)', soft: 'rgba(255,255,255,.10)', frame: '#160A33',
        celebrate: '#1A0B3D', blur: 'blur(18px) saturate(150%)',
    },
    split: {
        bg: '#073E3A', card: 'rgba(4,38,36,.5)', ink: '#FFFFFF', muted: 'rgba(255,255,255,.64)',
        line: 'rgba(255,255,255,.16)', soft: 'rgba(255,255,255,.08)', frame: '#052E2B',
        celebrate: '#073E3A', blur: 'blur(14px) saturate(140%)',
    },
    paper: {
        bg: '#F1EADB', card: '#FBF6EA', ink: '#2A2520', muted: '#6B5F4E',
        line: 'rgba(74,64,52,.18)', soft: '#EFE7D5', frame: '#E3D9C3',
        celebrate: '#2A2520', blur: 'none',
    },
};

/** Inputs needed to resolve the active accent. */
export interface AccentSettings {
    courtStyle: SkinId;
    accent: AccentKey;
    paperAccent: PaperAccentKey;
}

/** Resolve the active accent {c, ink} from settings + selected style. */
export function resolveAccent(settings: AccentSettings): { c: string; ink: string } {
    const style = settings.courtStyle || 'court';
    const fixed = FIXED_ACCENTS[style];
    if (fixed) return fixed;
    const pal: Record<string, Palette> = ACCENT_PICKERS[style] || PALETTES;
    const key = style === 'paper' ? settings.paperAccent : settings.accent;

    return pal[key] || Object.values(pal)[0];
}

export const SPEEDS: Record<'calm' | 'default' | 'snappy', number> = {
    calm: 640,
    default: 460,
    snappy: 300,
};
