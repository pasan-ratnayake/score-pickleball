/* Scoreboard.tsx — the court-shaped score page (singles + doubles).
 *
 * Receives a live match view `m` + a `skin` and renders all five court styles
 * from one component (every visual value is read from `skin`). Reuses the FLIP /
 * token / fx layer from anim.tsx. When the match is won it locks scoring and
 * shows a win overlay with a "See result" CTA. */

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

import type { MatchView } from '../../Stores/useMatchStore';
import type { Pair, TeamIdx } from '../../Types/Game';
import type { Slot } from '../../Utils/courtView';
import {
    calloutLong,
    calloutString,
    doublesServeCell,
    singlesCallout,
    singlesCalloutLong,
    singlesPOnRight,
    singlesServeCell,
    teamRow,
} from '../../Utils/courtView';
import {
    AnnounceLayer,
    CourtFxLayer,
    handleTapDoubles,
    handleTapSingles,
    ServerTokenLayer,
    useAnnounce,
    useCallout,
    useCourtFx,
    useFlipper,
} from './anim';
import { EditableName,Paddle  } from './Atoms';
import { ConfirmDialog, WinOverlay } from './Overlays';
import { RulesSheet } from './Rules';
import type { Skin } from './skins';
import { Icon } from './UiKit';

export type SkinFxColors = { point: string; ripple: string };

type FlipFn = (id: string) => (el: HTMLElement | null) => void;

interface ScoreboardProps {
    m: MatchView;
    skin: Skin;
    onExit: () => void;
    onNewMatch: () => void;
    onFinish: () => void;
    flipMs?: number;
}

export function Scoreboard({ m, skin, onExit, onNewMatch, onFinish, flipMs = 460 }: ScoreboardProps) {
    const sk = skin;
    const flip = useFlipper({ duration: Math.round(flipMs * 1.45), easing: 'cubic-bezier(.42,0,.16,1)' });
    const fx = useCourtFx();
    const announce = useAnnounce();
    const callout = useCallout();
    const FX = sk.fx;

    const single = m.mode === 'singles';
    const sc = single ? singlesServeCell(m) : doublesServeCell(m);
    const label = `${single ? 'Singles' : 'Doubles'} · to ${m.target}`;

    const serverTeam = single ? m.server : m.serverD.team;
    const calloutShort = single ? singlesCallout(m) : calloutString(m);
    const calloutFull = single ? singlesCalloutLong(m) : calloutLong(m);
    const announceColors = {
        bg: sk.id === 'paper' ? '#2A2520' : '#14181A',
        fg: sk.id === 'paper' ? '#FBF6EA' : '#fff',
        accent: sk.accent,
    };

    /* serve-change banner — fires once per new engine event (skips plain points) */
    const evSeq = m.event?.seq;
    useEffect(() => {
        const ev = m.event;
        if (!ev || ev.kind === 'point' || ev.over) return;
        if (ev.kind === 'second')
            announce.show({ title: 'Service change', body: 'Second server', team: ev.team });
        else announce.show({ title: 'Side out', body: `${ev.name} serves`, team: ev.team });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [evSeq]);

    const [confirm, setConfirm] = useState<'home' | 'new' | null>(null);
    const [rules, setRules] = useState(false);
    // Only guard a live match with progress — nothing to lose at 0–0 or once over.
    const dirty = m.pointsPlayed > 0 && !m.isOver;
    const askExit = () => (dirty ? setConfirm('home') : onExit());
    const askNew = () => (dirty ? setConfirm('new') : onNewMatch());

    const onCourtClick = (e: React.MouseEvent) => {
        if (m.isOver) return;
        if (single) handleTapSingles(e, m, fx, FX);
        else handleTapDoubles(e, m, fx, FX);
    };

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                background: sk.screenBg,
                fontFamily: sk.fontFamily,
                backgroundImage: sk.screenBgImage,
                backgroundBlendMode: sk.screenBgBlend,
            }}
        >
            {sk.decor === 'glass' && <GlassBlobs />}
            {sk.ruled && (
                <div
                    aria-hidden="true"
                    style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: sk.ruled }}
                />
            )}

            {/* header — Home · label · Undo · New match */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: 'max(10px, env(safe-area-inset-top)) 14px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexShrink: 0,
                }}
            >
                <button onClick={askExit} aria-label="Home" className="dink-btn" style={hdrBtn(sk, false, false, true)}>
                    {Icon.home({ s: 17, c: sk.header.plainInk })}
                </button>
                <button
                    onClick={() => setRules(true)}
                    aria-label="How to play"
                    className="dink-btn"
                    style={hdrBtn(sk, false, false, true)}
                >
                    {Icon.help({ s: 17, c: sk.header.plainInk })}
                </button>
                <span
                    style={{
                        flex: 1,
                        textAlign: 'left',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '.08em',
                        color: sk.header.text,
                        opacity: 0.8,
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {label}
                </span>
                <button onClick={m.undo} disabled={!m.canUndo} className="dink-btn" style={hdrBtn(sk, false, !m.canUndo)}>
                    <span style={{ fontSize: 16, lineHeight: 1, marginTop: -1 }}>↺</span> Undo
                </button>
                <button onClick={askNew} className="dink-btn" style={hdrBtn(sk, true, false)}>
                    New match
                </button>
            </div>

            <div style={{ position: 'relative', zIndex: 1, flex: 1, padding: '4px 14px 16px', minHeight: 0 }}>
                <div
                    role="button"
                    tabIndex={0}
                    onClick={onCourtClick}
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        background: sk.court.bg,
                        borderRadius: sk.court.radius,
                        overflow: 'hidden',
                        border: sk.court.border,
                        boxShadow: sk.court.shadow,
                        backdropFilter: sk.court.backdropFilter,
                        WebkitBackdropFilter: sk.court.backdropFilter,
                        cursor: m.isOver ? 'default' : 'pointer',
                    }}
                >
                    <CourtLines lines={sk.lines} />

                    {([1, 0] as TeamIdx[]).map((team) => (
                        <div
                            key={team}
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                [team === 1 ? 'top' : 'bottom']: 0,
                                height: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                            } as CSSProperties}
                        >
                            <div
                                key={m.score[team]}
                                data-fxnum
                                style={{
                                    fontSize: single ? sk.score.size : sk.score.sizeD,
                                    fontWeight: sk.score.weight,
                                    lineHeight: 0.85,
                                    color: serverTeam === team ? sk.score.servColor : sk.score.dimColor,
                                    opacity: serverTeam === team ? 1 : sk.score.dimOpacity,
                                    fontFamily: sk.score.font,
                                    fontVariantNumeric: 'tabular-nums',
                                    letterSpacing: sk.score.letter,
                                    textShadow: serverTeam === team ? sk.score.shadowServ : sk.score.shadowDim,
                                    animation: 'fxNumPop .52s cubic-bezier(.3,1.18,.4,1) both',
                                }}
                            >
                                {m.score[team]}
                            </div>
                        </div>
                    ))}

                    <BoardRow m={m} sk={sk} single={single} flip={flip} team={1} />
                    <BoardRow m={m} sk={sk} single={single} flip={flip} team={0} />

                    <ServerTokenLayer team={sc.team} cellRight={sc.cellRight} flipRef={flip('paddle')} padding={sk.padding}>
                        <BoardAvatar
                            m={m}
                            sk={sk}
                            single={single}
                            flip={flip}
                            team={sc.team}
                            slot={sc.slot}
                            alignBadge={sc.align}
                            role="token"
                        />
                    </ServerTokenLayer>
                    <CourtFxLayer items={fx.items} />
                    <AnnounceLayer item={announce.item} colors={announceColors} />

                    {/* net + callout pill */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            right: 0,
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                left: sk.net.inset,
                                right: sk.net.inset,
                                height: sk.net.height,
                                background: sk.net.bg,
                                borderRadius: 2,
                                opacity: sk.net.opacity,
                            }}
                        />
                        <button
                            {...callout.bind}
                            style={{
                                position: 'relative',
                                zIndex: 2,
                                background: sk.pill.bg,
                                color: sk.pill.color,
                                border: sk.pill.border,
                                borderRadius: sk.pill.radius,
                                padding: sk.pill.padding,
                                fontSize: sk.pill.size,
                                fontWeight: sk.pill.weight,
                                fontFamily: sk.pill.font,
                                fontVariantNumeric: 'tabular-nums',
                                letterSpacing: sk.pill.letter,
                                whiteSpace: 'nowrap',
                                pointerEvents: 'auto',
                                cursor: 'pointer',
                                boxShadow: sk.pill.shadow,
                            }}
                        >
                            {calloutShort}
                        </button>
                        {callout.open && (
                            <div style={{ ...tooltipBase(sk.tooltip.bg, sk.tooltip.fg), fontWeight: sk.tooltip.weight }}>
                                {calloutFull}
                            </div>
                        )}
                    </div>

                    {m.isOver && <WinOverlay m={m} skin={sk} onFinish={onFinish} />}
                </div>
            </div>

            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '0 18px max(14px, env(safe-area-inset-bottom))',
                    textAlign: 'center',
                    fontSize: sk.footer.italic ? 12 : 11,
                    fontStyle: sk.footer.italic ? 'italic' : 'normal',
                    fontFamily: sk.footer.font,
                    color: sk.footer.color,
                    fontWeight: 600,
                    letterSpacing: '.04em',
                }}
            >
                {m.isOver ? 'Game over' : 'Tap a half to score · tap the pill for serving info'}
            </div>

            {confirm && (
                <ConfirmDialog
                    skin={sk}
                    title={confirm === 'home' ? 'Leave this match?' : 'Start a new match?'}
                    body={
                        confirm === 'home'
                            ? 'The current score will be lost.'
                            : 'This match will be discarded and a new one set up.'
                    }
                    confirmLabel={confirm === 'home' ? 'Leave' : 'New match'}
                    onCancel={() => setConfirm(null)}
                    onConfirm={() => {
                        const a = confirm;
                        setConfirm(null);
                        if (a === 'home') onExit();
                        else onNewMatch();
                    }}
                />
            )}

            {rules && <RulesSheet onClose={() => setRules(false)} />}
        </div>
    );
}

/* ── Court avatar (module scope so the name input keeps focus across
 *    re-renders — a component defined inside Scoreboard would remount on
 *    every keystroke and drop focus after one character) ─────────────────── */
interface BoardAvatarProps {
    m: MatchView;
    sk: Skin;
    single: boolean;
    flip: FlipFn;
    team: TeamIdx;
    slot?: Slot;
    alignBadge?: 'left' | 'right';
    role?: 'court' | 'token';
    flipId?: string;
    isServ?: boolean;
}
function BoardAvatar({ m, sk, single, flip, team, slot, alignBadge = 'right', role = 'court', flipId, isServ }: BoardAvatarProps) {
    const A = sk.avatar;
    const token = role === 'token';
    const name = single ? (m.names as Pair)[team] : slot!.name;
    const hot = A.highlightServ && isServ;
    const size = single ? A.size : A.sizeD;

    return (
        <div
            ref={!token && flipId ? flip(flipId) : undefined}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
            <div style={{ position: 'relative' }}>
                <div
                    style={{
                        width: size,
                        height: size,
                        borderRadius: '50%',
                        background: hot ? A.faceBgServ : A.faceBg,
                        color: hot ? A.faceColorServ : A.faceColor,
                        fontWeight: A.faceWeight,
                        fontSize: A.faceSize,
                        fontFamily: A.faceFont,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: hot ? A.faceBorderServ : A.faceBorder,
                        boxShadow: hot ? A.faceShadowServ : A.faceShadow,
                        visibility: token ? 'hidden' : 'visible',
                    }}
                >
                    {(name.trim()[0] || '·').toUpperCase()}
                </div>
                {token && (
                    <div
                        style={
                            {
                                position: 'absolute',
                                [alignBadge]: -7,
                                bottom: -5,
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                background: A.tokenBg,
                                border: A.tokenBorder,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            } as CSSProperties
                        }
                    >
                        <Paddle
                            size={11}
                            color={A.paddle}
                            number={single ? undefined : m.serverD.number}
                            inkColor={A.paddleInk}
                        />
                    </div>
                )}
            </div>
            <EditableName
                value={name}
                onChange={(v) => (single ? m.setName(team, v) : m.setName(team, slot!.idx, v))}
                style={{
                    fontSize: 12,
                    fontWeight: A.nameWeight,
                    color: A.nameColor,
                    fontFamily: A.nameFont,
                    background: A.nameBg,
                    borderRadius: 7,
                    padding: '2px 8px',
                    maxWidth: single ? 110 : 90,
                    textTransform: A.nameUpper ? 'uppercase' : 'none',
                    letterSpacing: A.nameUpper ? '.05em' : '0',
                    visibility: token ? 'hidden' : 'visible',
                    pointerEvents: token ? 'none' : 'auto',
                }}
            />
        </div>
    );
}

interface BoardRowProps {
    m: MatchView;
    sk: Skin;
    single: boolean;
    flip: FlipFn;
    team: TeamIdx;
}
function BoardRow({ m, sk, single, flip, team }: BoardRowProps) {
    let left: React.ReactNode = null;
    let right: React.ReactNode = null;
    if (single) {
        const onRight = singlesPOnRight(m, team);
        const serving = m.server === team;
        const avatar = (
            <BoardAvatar m={m} sk={sk} single={single} flip={flip} team={team} flipId={`p${team}`} isServ={serving} />
        );
        if (onRight) right = avatar;
        else left = avatar;
    } else {
        const [L, R] = teamRow(m, team);
        left = (
            <BoardAvatar
                m={m}
                sk={sk}
                single={single}
                flip={flip}
                key={L.idx}
                team={team}
                slot={L}
                isServ={L.isServer}
                alignBadge="left"
                flipId={`p${team}-${L.idx}`}
            />
        );
        right = (
            <BoardAvatar
                m={m}
                sk={sk}
                single={single}
                flip={flip}
                key={R.idx}
                team={team}
                slot={R}
                isServ={R.isServer}
                alignBadge="right"
                flipId={`p${team}-${R.idx}`}
            />
        );
    }

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                padding: sk.padding,
                display: 'flex',
                flexDirection: team === 1 ? 'column' : 'column-reverse',
                pointerEvents: 'none',
            }}
        >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', pointerEvents: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>{left}</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>{right}</div>
            </div>
        </div>
    );
}

/* ── Court line sets ───────────────────────────────────────────────────── */
function CourtLines({ lines }: { lines: Skin['lines'] }) {
    const s = lines.stroke;
    if (lines.kind === 'paper') {
        return (
            <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                viewBox="0 0 100 200"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <rect x="0" y="84" width="100" height="32" fill={lines.kitchenFill} />
                <line x1="0" y1="84" x2="100" y2="84" stroke={s} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
                <line x1="0" y1="116" x2="100" y2="116" stroke={s} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
                <line x1="50" y1="0" x2="50" y2="84" stroke={s} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
                <line x1="50" y1="116" x2="50" y2="200" stroke={s} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
            </svg>
        );
    }

    return (
        <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            viewBox="0 0 100 200"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <rect x="6" y="6" width="88" height="188" fill="none" stroke={s} strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
            <line x1="6" y1="84" x2="94" y2="84" stroke={s} strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
            <line x1="6" y1="116" x2="94" y2="116" stroke={s} strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
            <line x1="50" y1="6" x2="50" y2="84" stroke={s} strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
            <line x1="50" y1="116" x2="50" y2="194" stroke={s} strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
            <rect x="6" y="84" width="88" height="32" fill={lines.kitchenFill} />
        </svg>
    );
}

function GlassBlobs() {
    return (
        <>
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: -60,
                    right: -40,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,.16) 0%, transparent 70%)',
                }}
            />
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    bottom: -80,
                    left: -60,
                    width: 240,
                    height: 240,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)',
                }}
            />
        </>
    );
}

function hdrBtn(sk: Skin, filled: boolean, disabled: boolean, iconOnly = false): CSSProperties {
    return {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        border: 0,
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: '"Bricolage Grotesque", system-ui',
        fontWeight: 800,
        fontSize: 13.5,
        padding: iconOnly ? '8px 11px' : '9px 15px',
        borderRadius: 999,
        background: filled ? sk.header.filledBg : sk.header.plainBg,
        color: filled ? sk.header.filledInk : sk.header.plainInk,
        boxShadow: sk.header.btnShadow,
        opacity: disabled ? 0.42 : 1,
    };
}

function tooltipBase(bg: string, fg: string): CSSProperties {
    return {
        position: 'absolute',
        top: 'calc(100% + 10px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: bg,
        color: fg,
        fontSize: 12,
        fontWeight: 600,
        padding: '8px 12px',
        borderRadius: 10,
        whiteSpace: 'nowrap',
        boxShadow: '0 6px 18px rgba(0,0,0,.25)',
        pointerEvents: 'none',
        zIndex: 10,
    };
}
