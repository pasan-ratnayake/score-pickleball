/* UiKit.tsx — shared Dink UI: icons, buttons, controls, screen scaffold, frame.
 * Court-View language: sage canvas, white cards, ink text, themeable accent.
 * (The fake phone frame + status bar from the prototype are dropped; the app is
 * a responsive, mobile-first column centred on larger screens.) */

import type { ButtonHTMLAttributes, CSSProperties, ReactElement, ReactNode } from 'react';

import { accent, accentInk, T } from './theme';

/* ─── Icons (simple, geometric) ───────────────────────────────────────── */
interface IconProps {
    s?: number;
    c?: string;
}
export const Icon = {
    plus: ({ s = 20, c = 'currentColor' }: IconProps = {}): ReactElement => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
    ),
    chev: ({ s = 18, c = 'currentColor' }: IconProps = {}): ReactElement => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    clock: ({ s = 18, c = 'currentColor' }: IconProps = {}): ReactElement => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8.5" stroke={c} strokeWidth="1.8" />
            <path d="M12 7.5V12l3 2" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    list: ({ s = 18, c = 'currentColor' }: IconProps = {}): ReactElement => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
            <path d="M5 7h14M5 12h14M5 17h9" stroke={c} strokeWidth="1.9" strokeLinecap="round" />
        </svg>
    ),
    home: ({ s = 18, c = 'currentColor' }: IconProps = {}): ReactElement => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
            <path d="M4 11l8-6 8 6M6 10v8h12v-8" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    bolt: ({ s = 18, c = 'currentColor' }: IconProps = {}): ReactElement => (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
            <path d="M13 3L5 13h6l-1 8 8-10h-6l1-8z" fill={c} />
        </svg>
    ),
};

/* ─── Buttons ─────────────────────────────────────────────────────────── */
type BtnKind = 'primary' | 'secondary' | 'ghost';
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    kind?: BtnKind;
}

export function Btn({ kind = 'primary', children, style, ...rest }: BtnProps) {
    const base: CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontFamily: T.display,
        fontWeight: 800,
        fontSize: 16,
        borderRadius: 16,
        padding: '15px 22px',
        cursor: 'pointer',
        border: 0,
        width: '100%',
        transition: 'transform .12s ease, filter .15s ease',
        userSelect: 'none',
    };
    const kinds: Record<BtnKind, CSSProperties> = {
        primary: { background: accent, color: accentInk, boxShadow: '0 6px 0 rgba(20,24,26,.14)' },
        secondary: { background: T.ink, color: '#fff', boxShadow: '0 6px 0 rgba(20,24,26,.16)' },
        ghost: { background: 'transparent', color: T.ink, boxShadow: 'none', border: `1.5px solid ${T.line}` },
    };

    return (
        <button {...rest} className="dink-btn" style={{ ...base, ...kinds[kind], ...style }}>
            {children}
        </button>
    );
}

/* ─── Segmented control ───────────────────────────────────────────────── */
interface SegOption<V> {
    value: V;
    label: string;
}
interface SegmentedProps<V extends string | number> {
    value: V;
    onChange: (v: V) => void;
    options: SegOption<V>[];
    style?: CSSProperties;
}

export function Segmented<V extends string | number>({ value, onChange, options, style }: SegmentedProps<V>) {
    return (
        <div
            style={{
                display: 'grid',
                gridAutoFlow: 'column',
                gridAutoColumns: '1fr',
                gap: 4,
                padding: 4,
                background: T.soft,
                borderRadius: 14,
                border: `1px solid ${T.line}`,
                ...style,
            }}
        >
            {options.map((o) => {
                const on = o.value === value;

                return (
                    <button
                        key={String(o.value)}
                        onClick={() => onChange(o.value)}
                        style={{
                            border: 0,
                            cursor: 'pointer',
                            borderRadius: 11,
                            padding: '10px 6px',
                            fontFamily: T.display,
                            fontWeight: 800,
                            fontSize: 14,
                            background: on ? accent : 'transparent',
                            color: on ? accentInk : T.muted,
                            boxShadow: on ? '0 2px 6px rgba(20,24,26,.14)' : 'none',
                            transition: 'background .18s ease, color .18s ease',
                        }}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}

interface ToggleProps {
    on: boolean;
    onChange: (on: boolean) => void;
}
export function Toggle({ on, onChange }: ToggleProps) {
    return (
        <button
            onClick={() => onChange(!on)}
            aria-pressed={on}
            style={{
                width: 50,
                height: 30,
                borderRadius: 999,
                border: 0,
                cursor: 'pointer',
                background: on ? accent : '#C7CFC4',
                position: 'relative',
                transition: 'background .2s ease',
                flexShrink: 0,
            }}
        >
            <span
                style={{
                    position: 'absolute',
                    top: 3,
                    left: on ? 23 : 3,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left .2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,.3)',
                }}
            />
        </button>
    );
}

interface CardProps {
    children: ReactNode;
    style?: CSSProperties;
    onClick?: () => void;
}
export function Card({ children, style, onClick }: CardProps) {
    return (
        <div
            onClick={onClick}
            style={{
                background: T.card,
                borderRadius: 20,
                border: `1px solid ${T.line}`,
                boxShadow: '0 2px 0 rgba(20,24,26,.04)',
                ...style,
            }}
        >
            {children}
        </div>
    );
}

interface LabelProps {
    children: ReactNode;
    style?: CSSProperties;
}
export function Label({ children, style }: LabelProps) {
    return (
        <div
            style={{
                fontFamily: T.display,
                fontWeight: 800,
                fontSize: 12.5,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: T.muted,
                margin: '0 0 9px',
                ...style,
            }}
        >
            {children}
        </div>
    );
}

/** Round, transparent icon-button chrome (back chevron, settings gear, …). */
export const chrome = (color: string): CSSProperties => ({
    width: 34,
    height: 34,
    borderRadius: 999,
    background: 'transparent',
    border: 0,
    color,
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
});

interface TopBarProps {
    title: string;
    onBack?: () => void;
    right?: ReactNode;
}
export function TopBar({ title, onBack, right }: TopBarProps) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '2px 0 16px',
                minHeight: 38,
            }}
        >
            {onBack ? (
                <button onClick={onBack} aria-label="Back" style={{ ...chrome(T.ink), marginLeft: -8, fontSize: 26 }}>
                    ‹
                </button>
            ) : (
                <span style={{ width: 26 }} />
            )}
            <span style={{ fontFamily: T.display, fontWeight: 800, fontSize: 16, color: T.ink }}>{title}</span>
            <span style={{ width: 26, display: 'flex', justifyContent: 'flex-end' }}>{right}</span>
        </div>
    );
}

/* ─── Screen scaffold + responsive app frame ──────────────────────────── */
interface ScreenProps {
    children: ReactNode;
    bg?: string;
    pad?: boolean;
}
export function Screen({ children, bg = T.bg, pad = true }: ScreenProps) {
    return (
        <div
            className="dink-screen"
            style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                background: bg,
                animation: 'screenIn .34s cubic-bezier(.25,1,.4,1) both',
            }}
        >
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    padding: pad ? 'max(18px, env(safe-area-inset-top)) 22px 30px' : 0,
                }}
            >
                {children}
            </div>
        </div>
    );
}

interface AppFrameProps {
    children: ReactNode;
    screenBg?: string;
}
export function AppFrame({ children, screenBg = T.bg }: AppFrameProps) {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#DBDDD7',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    width: 'min(100vw, 430px)',
                    height: '100dvh',
                    maxHeight: 'min(100dvh, 932px)',
                    overflow: 'hidden',
                    background: screenBg,
                    boxShadow: '0 10px 50px rgba(0,0,0,.18)',
                }}
            >
                {children}
            </div>
        </div>
    );
}
