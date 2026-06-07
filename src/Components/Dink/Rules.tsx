/* Rules.tsx — "How to play" content for Dink.
 *
 * Theme-aware: reads the shared T tokens + accent (which DinkApp re-points per
 * Court Style), so the standalone screen matches the app shell and the in-game
 * sheet matches the active court style.
 *
 * Exports: RulesScreen (full screen, from Home) and RulesSheet (in-game overlay). */

import type { ReactNode } from 'react';
import { useState } from 'react';

import { accent, accentInk, T } from './theme';
import { Card, Screen, Segmented, TopBar } from './UiKit';

/* ── Small court diagram: serve goes cross-court; even score → right box ── */
function ServeDiagram() {
    const ink = 'var(--app-ink, #14181A)';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <svg width="108" height="150" viewBox="0 0 108 150" style={{ flexShrink: 0, color: ink }} aria-hidden="true">
                <rect
                    x="4"
                    y="4"
                    width="100"
                    height="142"
                    rx="6"
                    fill="color-mix(in oklab, var(--accent) 9%, transparent)"
                    stroke="currentColor"
                    strokeOpacity="0.32"
                    strokeWidth="1.4"
                />
                <line x1="4" y1="75" x2="104" y2="75" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" />
                <rect x="4" y="56" width="100" height="19" fill="color-mix(in oklab, var(--accent) 14%, transparent)" />
                <rect x="4" y="75" width="100" height="19" fill="color-mix(in oklab, var(--accent) 14%, transparent)" />
                <line x1="4" y1="56" x2="104" y2="56" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
                <line x1="4" y1="94" x2="104" y2="94" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
                <line x1="54" y1="4" x2="54" y2="56" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
                <line x1="54" y1="94" x2="54" y2="146" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
                <rect x="54" y="94" width="50" height="52" fill="color-mix(in oklab, var(--accent) 22%, transparent)" />
                <rect x="4" y="4" width="50" height="52" fill="color-mix(in oklab, var(--accent) 12%, transparent)" />
                <line
                    x1="79"
                    y1="120"
                    x2="29"
                    y2="30"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                />
                <circle cx="79" cy="120" r="5" fill="var(--accent)" />
                <circle cx="29" cy="30" r="3.5" fill="none" stroke="var(--accent)" strokeWidth="2" />
            </svg>
            <div>
                <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 15, color: T.ink, marginBottom: 5 }}>
                    Always serve cross-court
                </div>
                <div style={{ fontFamily: T.body, fontSize: 13, color: T.muted, lineHeight: 1.45, fontWeight: 500 }}>
                    Stand to the <b style={{ color: T.ink }}>right</b> when your score is even, the
                    <b style={{ color: T.ink }}> left</b> when it&apos;s odd. The serve must clear the kitchen and land in
                    the box diagonally across.
                </div>
            </div>
        </div>
    );
}

interface Rule {
    title: string;
    body: ReactNode;
}

function RuleItem({ n, rule }: { n: number; rule: Rule }) {
    return (
        <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
            <div
                style={{
                    width: 28,
                    height: 28,
                    borderRadius: 9,
                    flexShrink: 0,
                    background: accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                    fontFamily: T.display,
                    fontWeight: 800,
                    fontSize: 14,
                    color: accentInk,
                }}
            >
                {n}
            </div>
            <div>
                <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 15.5, color: T.ink, marginBottom: 3 }}>
                    {rule.title}
                </div>
                <div
                    style={{
                        fontFamily: T.body,
                        fontSize: 13.5,
                        color: T.muted,
                        lineHeight: 1.5,
                        fontWeight: 500,
                        textWrap: 'pretty',
                    }}
                >
                    {rule.body}
                </div>
            </div>
        </div>
    );
}

function RulesLabel({ children }: { children: ReactNode }) {
    return (
        <div
            style={{
                fontFamily: T.display,
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: T.muted,
                margin: '0 0 12px',
            }}
        >
            {children}
        </div>
    );
}

const UNIVERSAL: Rule[] = [
    {
        title: 'The basics',
        body: (
            <>
                Games go to <b>11</b> and you must <b>win by 2</b>. Only the side that&apos;s serving can score — win a
                rally on your serve and you take the point.
            </>
        ),
    },
    {
        title: 'Serving',
        body: (
            <>
                Serve <b>underhand</b>, striking the ball below your waist. The serve travels diagonally and must land
                past the kitchen in the service box across from you.
            </>
        ),
    },
    {
        title: 'The two-bounce rule',
        body: (
            <>
                Right after the serve the ball must bounce <b>once on each side</b> before it can be hit in the air:
                serve bounces, return bounces, then volleys are allowed.
            </>
        ),
    },
    {
        title: 'The kitchen',
        body: (
            <>
                The 7-foot zone at the net is the <b>non-volley zone</b>. You can&apos;t volley while standing in it or
                on its line — step in only to play a ball that has already bounced.
            </>
        ),
    },
    {
        title: 'Faults',
        body: (
            <>
                A rally ends on a fault: the ball lands <b>out</b>, hits the <b>net</b>, is{' '}
                <b>volleyed from the kitchen</b>, or breaks the two-bounce rule.
            </>
        ),
    },
];

const SINGLES: Rule[] = [
    {
        title: 'One server',
        body: <>There&apos;s a single server per side. Keep serving — and scoring — as long as you keep winning rallies.</>,
    },
    {
        title: 'Side-out',
        body: <>Lose a rally and the serve passes to your opponent. They don&apos;t get a point — only the server can score.</>,
    },
    {
        title: 'Reading the score',
        body: (
            <>
                It&apos;s called as two numbers — <b>your score, then theirs</b>. Your score also sets your serve side:
                right when even, left when odd.
            </>
        ),
    },
];

const DOUBLES: Rule[] = [
    {
        title: 'Both partners serve',
        body: (
            <>
                Each player on a team serves before the serve passes over — except the very first service of the game,
                when the starting team gets just <b>one</b> server.
            </>
        ),
    },
    {
        title: 'Three-number score',
        body: (
            <>
                The score is called as <b>your score – their score – server number</b> (1 or 2). Every game begins at{' '}
                <b>0–0–2</b>.
            </>
        ),
    },
    {
        title: 'Win, swap & repeat',
        body: (
            <>
                Win a rally on serve and the two partners <b>swap sides</b>; the same player serves again. Lose it and
                your partner serves (server 2). Lose again — side-out.
            </>
        ),
    },
];

/** The scrollable body, shared by the full screen and the in-game sheet. */
export function RulesBody() {
    const [fmt, setFmt] = useState<'singles' | 'doubles'>('singles');
    const list = fmt === 'singles' ? SINGLES : DOUBLES;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <Card style={{ padding: 16 }}>
                <ServeDiagram />
            </Card>

            <div>
                <RulesLabel>The rules, either way</RulesLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {UNIVERSAL.map((r, i) => (
                        <RuleItem key={i} n={i + 1} rule={r} />
                    ))}
                </div>
            </div>

            <div>
                <RulesLabel>By format</RulesLabel>
                <Segmented
                    value={fmt}
                    onChange={setFmt}
                    options={[
                        { value: 'singles', label: 'Singles' },
                        { value: 'doubles', label: 'Doubles' },
                    ]}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18 }}>
                    {list.map((r, i) => (
                        <RuleItem key={fmt + i} n={i + 1} rule={r} />
                    ))}
                </div>
            </div>

            <div
                style={{
                    fontFamily: T.body,
                    fontSize: 12,
                    color: T.muted,
                    textAlign: 'center',
                    fontWeight: 500,
                    opacity: 0.8,
                    paddingTop: 2,
                }}
            >
                Tip: in Dink, just tap the half of the court that won the rally.
            </div>
        </div>
    );
}

/** Standalone screen (Home → How to play). */
export function RulesScreen({ onBack }: { onBack: () => void }) {
    return (
        <Screen>
            <TopBar title="How to play" onBack={onBack} />
            <RulesBody />
        </Screen>
    );
}

/** In-game sheet (scoreboard ? button). Inherits the active theme via T. */
export function RulesSheet({ onClose }: { onClose: () => void }) {
    return (
        <div
            onClick={onClose}
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 40,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                background: 'rgba(8,10,12,.5)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                style={{
                    position: 'relative',
                    background: T.card,
                    backdropFilter: 'var(--app-card-blur, none)',
                    WebkitBackdropFilter: 'var(--app-card-blur, none)',
                    borderTopLeftRadius: 26,
                    borderTopRightRadius: 26,
                    borderTop: `1px solid ${T.line}`,
                    maxHeight: '88%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 -16px 50px rgba(0,0,0,.4)',
                    animation: 'screenIn .3s cubic-bezier(.25,1,.4,1) both',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px 10px',
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            width: 38,
                            height: 4,
                            borderRadius: 999,
                            background: T.line,
                            position: 'absolute',
                            left: '50%',
                            top: 8,
                            transform: 'translateX(-50%)',
                        }}
                    />
                    <span
                        style={{
                            fontFamily: T.display,
                            fontWeight: 900,
                            fontSize: 19,
                            color: T.ink,
                            letterSpacing: '-0.01em',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        How to play
                    </span>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 999,
                            border: 0,
                            cursor: 'pointer',
                            background: T.soft,
                            color: T.ink,
                            fontSize: 18,
                            fontWeight: 700,
                            lineHeight: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        ×
                    </button>
                </div>
                <div style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '6px 20px 26px' }}>
                    <RulesBody />
                </div>
            </div>
        </div>
    );
}
