/* skins.ts — five court "styles" for the live scoreboard.
 *
 * Every style shares the exact same structure (a court fills the screen, two
 * halves with vertically-centred scores, a travelling server paddle, a callout
 * pill at the net). They differ ONLY in skinning, captured here as tokens the
 * Scoreboard reads. Adding a style = adding an entry to SKINS. */

import type { SkinId } from '../../Types/Game';
import { BRICO, INTER, SERIF } from './theme';

/** Tiny fractal-noise paper grain for the Clean style. */
export const PAPER_GRAIN_URL =
    "url(\"data:image/svg+xml;utf8," +
    "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>" +
    "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>" +
    "<feColorMatrix values='0 0 0 0 0.18  0 0 0 0 0.14  0 0 0 0 0.1  0 0 0 0.5 0'/></filter>" +
    "<rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\")";

/* Court View follows the live --accent var so it tracks the app theme. */
const ACCENT = 'var(--accent, #2E7D52)';
const ACCENT_DEEP = 'color-mix(in oklab, var(--accent, #2E7D52) 84%, #000)';

interface SkinHeader {
    text: string;
    plainBg: string;
    plainInk: string;
    filledBg: string;
    filledInk: string;
    btnShadow: string;
}
interface SkinFooter {
    color: string;
    font: string;
    italic: boolean;
}
interface SkinCourt {
    bg: string;
    radius: number;
    backdropFilter: string;
    shadow: string;
    surface: string;
    border?: string;
}
interface SkinLines {
    kind: 'standard' | 'paper';
    stroke: string;
    strokeOpacity: number;
    kitchenFill: string;
}
interface SkinScore {
    font: string;
    weight: number;
    size: number;
    sizeD: number;
    servColor: string;
    dimColor: string;
    dimOpacity: number;
    shadowServ: string;
    shadowDim: string;
    letter: string;
}
interface SkinAvatar {
    size: number;
    sizeD: number;
    faceFont: string;
    faceWeight: number;
    faceSize: number;
    faceBg: string;
    faceColor: string;
    faceBorder: string;
    faceShadow: string;
    highlightServ: boolean;
    faceBgServ: string;
    faceColorServ: string;
    faceBorderServ: string;
    faceShadowServ: string;
    tokenBg: string;
    tokenBorder: string;
    paddle: string;
    paddleInk: string;
    nameBg: string;
    nameColor: string;
    nameFont: string;
    nameWeight: number;
    nameUpper?: boolean;
}
interface SkinPill {
    bg: string;
    color: string;
    border: string;
    radius: number;
    font: string;
    weight: number;
    size: number;
    shadow: string;
    letter: string;
    padding: string;
}
interface SkinNet {
    bg: string;
    height: number;
    opacity: number;
    inset: number;
}
interface SkinTooltip {
    bg: string;
    fg: string;
    weight: number;
}
interface SkinFx {
    point: string;
    ripple: string;
}

export interface Skin {
    id: SkinId;
    label: string;
    swatch: string;
    swatchDot?: string;
    swatchInk?: string;
    screenBg: string;
    screenBgImage?: string;
    screenBgBlend?: string;
    decor?: 'glass';
    ruled?: string;
    fontFamily: string;
    header: SkinHeader;
    footer: SkinFooter;
    court: SkinCourt;
    lines: SkinLines;
    score: SkinScore;
    avatar: SkinAvatar;
    pill: SkinPill;
    net: SkinNet;
    tooltip: SkinTooltip;
    fx: SkinFx;
    accent: string;
    accentInk: string;
    overlayInk: string;
    padding: string;
}

export const SKINS: Record<SkinId, Skin> = {
    /* ── 1 · Court View ─────────────────────────────────────────────────── */
    court: {
        id: 'court',
        label: 'Court',
        swatch: 'linear-gradient(135deg, #2E7D52 0%, #2A7048 100%)',
        screenBg: '#DEE9DD',
        fontFamily: BRICO,
        header: {
            text: '#14181A',
            plainBg: '#fff',
            plainInk: '#14181A',
            filledBg: '#14181A',
            filledInk: '#fff',
            btnShadow: '0 2px 0 rgba(20,24,26,.12)',
        },
        footer: { color: '#4F5A52', font: BRICO, italic: false },
        court: {
            bg: 'linear-gradient(180deg, ' + ACCENT + ' 0%, ' + ACCENT_DEEP + ' 50%, ' + ACCENT + ' 100%)',
            radius: 22,
            backdropFilter: 'none',
            shadow: 'inset 0 0 0 8px ' + ACCENT_DEEP + ', 0 8px 22px rgba(0,0,0,.15)',
            surface: 'rgba(255,255,255,.4)',
        },
        lines: { kind: 'standard', stroke: '#fff', strokeOpacity: 1, kitchenFill: 'rgba(255,255,255,.08)' },
        score: {
            font: BRICO, weight: 800, size: 132, sizeD: 116, servColor: '#fff', dimColor: 'rgba(255,255,255,.42)',
            dimOpacity: 1, shadowServ: '0 2px 0 rgba(0,0,0,.15)', shadowDim: 'none', letter: '0',
        },
        avatar: {
            size: 42, sizeD: 40, faceFont: BRICO, faceWeight: 800, faceSize: 17,
            faceBg: '#FBFAF6', faceColor: '#14181A', faceBorder: 'none', faceShadow: '0 2px 0 rgba(0,0,0,.15)',
            highlightServ: false, faceBgServ: '#FBFAF6', faceColorServ: '#14181A', faceBorderServ: 'none', faceShadowServ: '0 2px 0 rgba(0,0,0,.15)',
            tokenBg: '#14181A', tokenBorder: '2px solid #fff', paddle: '#FFB300', paddleInk: '#14181A',
            nameBg: 'rgba(255,255,255,.85)', nameColor: '#14181A', nameFont: BRICO, nameWeight: 800,
        },
        pill: {
            bg: '#14181A', color: '#fff', border: '3px solid #fff', radius: 999, font: BRICO, weight: 800,
            size: 22, shadow: '0 4px 0 rgba(0,0,0,.18)', letter: '-0.02em', padding: '8px 18px',
        },
        net: { bg: 'repeating-linear-gradient(90deg, #fff 0 6px, transparent 6px 10px)', height: 3, opacity: 0.9, inset: 12 },
        tooltip: { bg: '#14181A', fg: '#fff', weight: 600 },
        fx: { point: '#FFB300', ripple: 'rgba(255,255,255,.75)' },
        accent: '#FFB300', accentInk: '#14181A', overlayInk: '#14181A',
        padding: '16px 0',
    },

    /* ── 2 · Broadcast Court ────────────────────────────────────────────── */
    broadcast: {
        id: 'broadcast',
        label: 'Neon',
        swatch: 'linear-gradient(135deg, #1A1F28 0%, #0A0B0E 100%)',
        swatchDot: '#A6FF00',
        screenBg: '#000',
        fontFamily: INTER,
        header: {
            text: 'rgba(255,255,255,.7)', plainBg: '#fff', plainInk: '#0A0B0E', filledBg: '#A6FF00', filledInk: '#0A0B0E',
            btnShadow: '0 0 18px rgba(166,255,0,.35)',
        },
        footer: { color: 'rgba(255,255,255,.4)', font: INTER, italic: false },
        court: {
            bg: '#1A1F28', radius: 22, backdropFilter: 'none',
            shadow: 'inset 0 0 0 1px rgba(166,255,0,.18), inset 0 0 60px rgba(166,255,0,.04), 0 8px 28px rgba(0,0,0,.5)',
            surface: 'rgba(166,255,0,.04)',
        },
        lines: { kind: 'standard', stroke: 'rgba(166,255,0,.5)', strokeOpacity: 1, kitchenFill: 'rgba(166,255,0,.06)' },
        score: {
            font: BRICO, weight: 800, size: 140, sizeD: 124, servColor: '#A6FF00', dimColor: 'rgba(255,255,255,.18)',
            dimOpacity: 1, shadowServ: '0 0 40px rgba(166,255,0,.5)', shadowDim: 'none', letter: '0',
        },
        avatar: {
            size: 42, sizeD: 42, faceFont: INTER, faceWeight: 800, faceSize: 18,
            faceBg: 'rgba(255,255,255,.1)', faceColor: '#fff', faceBorder: '2px solid rgba(255,255,255,.2)', faceShadow: 'none',
            highlightServ: true, faceBgServ: '#A6FF00', faceColorServ: '#0A0B0E', faceBorderServ: '2px solid #A6FF00', faceShadowServ: '0 0 18px rgba(166,255,0,.55)',
            tokenBg: '#0A0B0E', tokenBorder: '2px solid #A6FF00', paddle: '#A6FF00', paddleInk: '#0A0B0E',
            nameBg: 'rgba(255,255,255,.06)', nameColor: '#fff', nameFont: INTER, nameWeight: 700, nameUpper: true,
        },
        pill: {
            bg: '#A6FF00', color: '#0A0B0E', border: '3px solid #0A0B0E', radius: 999, font: BRICO, weight: 800,
            size: 22, shadow: '0 0 28px rgba(166,255,0,.6)', letter: '-0.02em', padding: '8px 18px',
        },
        net: { bg: 'repeating-linear-gradient(90deg, rgba(166,255,0,.7) 0 6px, transparent 6px 10px)', height: 2, opacity: 1, inset: 12 },
        tooltip: { bg: '#A6FF00', fg: '#0A0B0E', weight: 700 },
        fx: { point: '#A6FF00', ripple: 'rgba(166,255,0,.6)' },
        accent: '#A6FF00', accentInk: '#0A0B0E', overlayInk: '#A6FF00',
        padding: '16px 0',
    },

    /* ── 3 · Glass ──────────────────────────────────────────────────────── */
    glass: {
        id: 'glass',
        label: 'Glass',
        swatch: 'linear-gradient(150deg, #3D1170 0%, #B83270 100%)',
        screenBg: 'linear-gradient(160deg, #1A0B3D 0%, #3D1170 32%, #7C1D6F 62%, #B83270 100%)',
        decor: 'glass',
        fontFamily: INTER,
        header: {
            text: 'rgba(255,255,255,.9)', plainBg: 'rgba(255,255,255,.9)', plainInk: '#1A0B3D', filledBg: '#1A0B3D', filledInk: '#fff',
            btnShadow: '0 6px 18px rgba(0,0,0,.25)',
        },
        footer: { color: 'rgba(255,255,255,.65)', font: INTER, italic: false },
        court: {
            bg: 'rgba(10,5,35,.32)', radius: 28, backdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(255,255,255,.18)',
            shadow: 'inset 0 1px 0 rgba(255,255,255,.25), 0 18px 50px rgba(0,0,0,.35)',
            surface: 'rgba(255,255,255,.05)',
        },
        lines: { kind: 'standard', stroke: 'rgba(255,255,255,.4)', strokeOpacity: 1, kitchenFill: 'rgba(255,255,255,.05)' },
        score: {
            font: BRICO, weight: 800, size: 130, sizeD: 116, servColor: '#fff', dimColor: 'rgba(255,255,255,.38)',
            dimOpacity: 1, shadowServ: '0 4px 28px rgba(0,0,0,.45)', shadowDim: '0 2px 10px rgba(0,0,0,.25)', letter: '0',
        },
        avatar: {
            size: 44, sizeD: 42, faceFont: BRICO, faceWeight: 800, faceSize: 19,
            faceBg: 'rgba(255,255,255,.22)', faceColor: '#fff', faceBorder: '2px solid rgba(255,255,255,.5)', faceShadow: 'none',
            highlightServ: true, faceBgServ: '#fff', faceColorServ: '#1A0B3D', faceBorderServ: '2px solid rgba(255,255,255,.5)', faceShadowServ: '0 4px 14px rgba(0,0,0,.35)',
            tokenBg: '#1A0B3D', tokenBorder: '2px solid #fff', paddle: '#fff', paddleInk: '#1A0B3D',
            nameBg: 'rgba(0,0,0,.22)', nameColor: '#fff', nameFont: INTER, nameWeight: 700,
        },
        pill: {
            bg: 'rgba(255,255,255,.97)', color: '#1A0B3D', border: '3px solid rgba(255,255,255,.7)', radius: 999, font: BRICO, weight: 800,
            size: 22, shadow: '0 12px 40px rgba(0,0,0,.4)', letter: '0', padding: '8px 18px',
        },
        net: { bg: 'repeating-linear-gradient(90deg, rgba(255,255,255,.85) 0 6px, transparent 6px 10px)', height: 3, opacity: 1, inset: 12 },
        tooltip: { bg: '#1A0B3D', fg: '#fff', weight: 600 },
        fx: { point: '#fff', ripple: 'rgba(255,255,255,.7)' },
        accent: '#fff', accentInk: '#1A0B3D', overlayInk: '#fff',
        padding: '16px 0',
    },

    /* ── 4 · Court Split ────────────────────────────────────────────────── */
    split: {
        id: 'split',
        label: 'Split',
        swatch: 'linear-gradient(135deg, #0E766E 0%, #0B5752 100%)',
        swatchDot: '#FFD43B',
        screenBg: '#073E3A',
        fontFamily: INTER,
        header: {
            text: 'rgba(255,255,255,.75)', plainBg: '#fff', plainInk: '#0B5752', filledBg: '#FFD43B', filledInk: '#0B5752',
            btnShadow: '0 2px 0 rgba(0,0,0,.2)',
        },
        footer: { color: 'rgba(255,255,255,.5)', font: INTER, italic: false },
        court: {
            bg: 'linear-gradient(180deg, #0E766E 0%, #0B5752 50%, #0E766E 100%)', radius: 22, backdropFilter: 'none',
            shadow: 'inset 0 0 0 6px #073E3A, 0 8px 22px rgba(0,0,0,.25)',
            surface: 'rgba(255,212,59,.05)',
        },
        lines: { kind: 'standard', stroke: 'rgba(255,255,255,.5)', strokeOpacity: 1, kitchenFill: 'rgba(255,212,59,.05)' },
        score: {
            font: BRICO, weight: 800, size: 140, sizeD: 124, servColor: '#FFD43B', dimColor: 'rgba(255,255,255,.28)',
            dimOpacity: 1, shadowServ: '0 2px 0 rgba(0,0,0,.2)', shadowDim: 'none', letter: '-0.02em',
        },
        avatar: {
            size: 44, sizeD: 42, faceFont: BRICO, faceWeight: 800, faceSize: 19,
            faceBg: 'rgba(255,255,255,.14)', faceColor: 'rgba(255,255,255,.95)', faceBorder: '2px solid rgba(255,255,255,.3)', faceShadow: 'none',
            highlightServ: true, faceBgServ: '#FFD43B', faceColorServ: '#0B5752', faceBorderServ: '2px solid #FFD43B', faceShadowServ: '0 0 18px rgba(255,212,59,.55)',
            tokenBg: '#0B5752', tokenBorder: '2px solid #FFD43B', paddle: '#FFD43B', paddleInk: '#0B5752',
            nameBg: 'rgba(0,0,0,.18)', nameColor: '#fff', nameFont: INTER, nameWeight: 700,
        },
        pill: {
            bg: '#FFD43B', color: '#0B5752', border: '3px solid #073E3A', radius: 999, font: BRICO, weight: 800,
            size: 22, shadow: '0 4px 0 rgba(0,0,0,.25), 0 0 24px rgba(255,212,59,.4)', letter: '-0.02em', padding: '8px 18px',
        },
        net: { bg: 'repeating-linear-gradient(90deg, #fff 0 6px, transparent 6px 10px)', height: 3, opacity: 0.85, inset: 12 },
        tooltip: { bg: '#073E3A', fg: '#FFD43B', weight: 600 },
        fx: { point: '#FFD43B', ripple: 'rgba(255,255,255,.7)' },
        accent: '#FFD43B', accentInk: '#0B5752', overlayInk: '#FFD43B',
        padding: '16px 0',
    },

    /* ── 5 · Clean & Spacious (Paper) ───────────────────────────────────── */
    paper: {
        id: 'paper',
        label: 'Paper',
        swatch: 'linear-gradient(135deg, #F1EADB 0%, #E8E0CE 100%)',
        swatchDot: '#9C4A2A',
        swatchInk: '#2A2520',
        screenBg: '#F1EADB',
        screenBgImage: 'radial-gradient(120% 80% at 50% 50%, transparent 55%, rgba(0,0,0,.06) 100%), ' + PAPER_GRAIN_URL,
        screenBgBlend: 'normal, multiply',
        ruled: 'repeating-linear-gradient(to bottom, transparent 0 35px, #C9BCA040 35px 36px)',
        fontFamily: INTER,
        header: {
            text: '#2A2520', plainBg: '#FBF6EA', plainInk: '#2A2520', filledBg: '#2A2520', filledInk: '#FBF6EA',
            btnShadow: '0 2px 0 rgba(74,64,52,.18)',
        },
        footer: { color: '#6B5F4E', font: SERIF, italic: true },
        court: {
            bg: 'rgba(251,246,234,.4)', radius: 8, backdropFilter: 'none',
            border: '2.5px solid #2A2520', shadow: 'inset 0 0 22px rgba(74,64,52,.07)',
            surface: 'rgba(251,246,234,.4)',
        },
        lines: { kind: 'paper', stroke: '#2A2520', strokeOpacity: 1, kitchenFill: 'rgba(74,64,52,.05)' },
        score: {
            font: SERIF, weight: 400, size: 122, sizeD: 110, servColor: '#2A2520', dimColor: '#6B5F4E',
            dimOpacity: 0.5, shadowServ: 'none', shadowDim: 'none', letter: '-0.04em',
        },
        avatar: {
            size: 46, sizeD: 44, faceFont: SERIF, faceWeight: 500, faceSize: 21,
            faceBg: '#FBF6EA', faceColor: '#2A2520', faceBorder: '2.5px solid #2A2520', faceShadow: '0 2px 0 rgba(74,64,52,.22)',
            highlightServ: false, faceBgServ: '#FBF6EA', faceColorServ: '#2A2520', faceBorderServ: '2.5px solid #2A2520', faceShadowServ: '0 2px 0 rgba(74,64,52,.22)',
            tokenBg: '#9C4A2A', tokenBorder: '2.5px solid #FBF6EA', paddle: '#FBF6EA', paddleInk: '#9C4A2A',
            nameBg: 'rgba(251,246,234,.9)', nameColor: '#2A2520', nameFont: INTER, nameWeight: 700,
        },
        pill: {
            bg: '#F1EADB', color: '#2A2520', border: '2px solid #2A2520', radius: 999, font: SERIF, weight: 500,
            size: 17, shadow: '0 2px 0 rgba(74,64,52,.18)', letter: '.02em', padding: '7px 16px',
        },
        net: { bg: 'repeating-linear-gradient(90deg, #2A2520 0 5px, transparent 5px 9px)', height: 3, opacity: 0.85, inset: 0 },
        tooltip: { bg: '#2A2520', fg: '#F1EADB', weight: 500 },
        fx: { point: '#9C4A2A', ripple: 'rgba(74,64,52,.32)' },
        accent: '#9C4A2A', accentInk: '#FBF6EA', overlayInk: '#9C4A2A',
        padding: '18px 0',
    },
};

export const SKIN_ORDER: SkinId[] = ['court', 'broadcast', 'glass', 'split', 'paper'];
