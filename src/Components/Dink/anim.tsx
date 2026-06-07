/* anim.tsx — shared animation layer for the score page.
 *
 *  • useFlipper()      FLIP engine. flip(id) → a STABLE ref callback; any element
 *                      tagged with a flip id animates from its previous layout
 *                      position whenever it moves (player swaps court, paddle
 *                      travels to a new server, …).
 *  • useCourtFx()      transient tap feedback — ripples + floating "+1" pips.
 *  • CourtFxLayer      renders the ripples / pips.
 *  • useCallout()      hover/tap state for the centre callout pill.
 *  • useAnnounce()     transient serve-change banner.
 *  • ServerTokenLayer  places the single travelling server paddle in the correct
 *                      court quadrant; FLIP glides it on change.
 *  • handleTap*        court tap → ripple + (point ⇒ +1 | side-out ⇒ travel). */

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { MatchView } from '../../Stores/useMatchStore';
import type { TeamIdx } from '../../Types/Game';
import type { SkinFxColors } from './Scoreboard';

const PREFERS_REDUCED_MOTION =
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type FlipNode = HTMLElement & { __flipAnim?: Animation };
export type FlipRef = (el: HTMLElement | null) => void;

/* ── FLIP ──────────────────────────────────────────────────────────────── */
export function useFlipper({ duration = 460, easing = 'cubic-bezier(.4,0,.18,1)' } = {}) {
    const nodes = useRef(new Map<string, FlipNode>());
    const prev = useRef(new Map<string, { x: number; y: number }>());
    const cbs = useRef(new Map<string, FlipRef>());

    const flip = (id: string): FlipRef => {
        if (!cbs.current.has(id)) {
            cbs.current.set(id, (el: HTMLElement | null) => {
                if (el) nodes.current.set(id, el as FlipNode);
                else nodes.current.delete(id);
            });
        }

        return cbs.current.get(id)!;
    };

    useLayoutEffect(() => {
        nodes.current.forEach((el, id) => {
            const x = el.offsetLeft;
            const y = el.offsetTop;
            const p = prev.current.get(id);
            if (p && !PREFERS_REDUCED_MOTION) {
                const dx = p.x - x;
                const dy = p.y - y;
                if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                    el.__flipAnim?.cancel();
                    el.__flipAnim = el.animate(
                        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
                        { duration, easing }
                    );
                }
            }
            prev.current.set(id, { x, y });
        });
    });

    return flip;
}

/* ── Tap feedback (ripple + "+1") ──────────────────────────────────────── */
let fxSeq = 0;
interface FxItem {
    id: number;
    type: 'ripple' | 'point';
    x?: number;
    y?: number;
    color: string;
    team?: TeamIdx;
    ttl: number;
}

export function useCourtFx() {
    const [items, setItems] = useState<FxItem[]>([]);
    const add = (it: Omit<FxItem, 'id'>) => {
        const id = ++fxSeq;
        setItems((s) => [...s, { ...it, id }]);
        setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), it.ttl);
    };

    return {
        items,
        ripple: (x: number, y: number, color: string) => add({ type: 'ripple', x, y, color, ttl: 850 }),
        point: (team: TeamIdx, color: string) => add({ type: 'point', team, color, ttl: 1350 }),
    };
}

export function CourtFxLayer({ items }: { items: FxItem[] }) {
    return (
        <div
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 6 }}
        >
            {items.map((it) =>
                it.type === 'ripple' ? (
                    <span
                        key={it.id}
                        style={{
                            position: 'absolute',
                            left: it.x,
                            top: it.y,
                            width: 132,
                            height: 132,
                            marginLeft: -66,
                            marginTop: -66,
                            borderRadius: '50%',
                            border: `2px solid ${it.color}`,
                            animation: 'fxRipple .7s ease-out forwards',
                        }}
                    />
                ) : (
                    <span
                        key={it.id}
                        style={
                            {
                                position: 'absolute',
                                left: '50%',
                                [it.team === 1 ? 'top' : 'bottom']: '22%',
                                fontFamily: '"Bricolage Grotesque", system-ui',
                                fontSize: 58,
                                fontWeight: 800,
                                lineHeight: 1,
                                color: it.color,
                                textShadow: '0 3px 14px rgba(0,0,0,.3)',
                                animation: 'fxPipUp 1.2s cubic-bezier(.32,.72,.26,1) forwards',
                            } as CSSProperties
                        }
                    >
                        +1
                    </span>
                )
            )}
        </div>
    );
}

/* ── Centre-callout hover/tap state ────────────────────────────────────── */
export function useCallout() {
    const [open, setOpen] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);

    return {
        open,
        bind: {
            onMouseEnter: () => {
                clearTimeout(timer.current);
                setOpen(true);
            },
            onMouseLeave: () => {
                clearTimeout(timer.current);
                setOpen(false);
            },
            onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();
                clearTimeout(timer.current);
                setOpen(true);
                timer.current = setTimeout(() => setOpen(false), 1800);
            },
        },
    };
}

/* ── Announcement banner ("Side out · Riley serves") ───────────────────── */
interface AnnounceItem {
    title: string;
    body: string;
    team: TeamIdx;
    key: number;
}
export function useAnnounce() {
    const [item, setItem] = useState<AnnounceItem | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);
    const show = (data: { title: string; body: string; team: TeamIdx }, ttl = 2200) => {
        clearTimeout(timer.current);
        setItem({ ...data, key: ++fxSeq });
        timer.current = setTimeout(() => setItem(null), ttl);
    };

    return { item, show };
}

interface AnnounceColors {
    bg: string;
    fg: string;
    accent: string;
}
export function AnnounceLayer({ item, colors }: { item: AnnounceItem | null; colors: AnnounceColors }) {
    if (!item) return null;
    // Sit in the gap between the centre callout and that side's big score,
    // leaning toward the net, on the serving team's half (team 1 = top).
    const top = item.team === 1 ? '38%' : '62%';

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top,
                transform: 'translateY(-50%)',
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 7,
            }}
        >
            <div
                key={item.key}
                role="status"
                style={{
                    animation: 'fxAnnounce 2.2s cubic-bezier(.3,.9,.3,1) forwards',
                    background: colors.bg,
                    borderRadius: 999,
                    padding: '7px 18px 8px',
                    border: '2px solid rgba(255,255,255,.16)',
                    textAlign: 'center',
                    maxWidth: '88%',
                    boxShadow: '0 10px 26px rgba(0,0,0,.34)',
                }}
            >
                <div
                    style={{
                        fontFamily: '"Bricolage Grotesque", system-ui',
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '.16em',
                        textTransform: 'uppercase',
                        color: colors.accent,
                    }}
                >
                    {item.title}
                </div>
                <div
                    style={{
                        fontFamily: '"Bricolage Grotesque", system-ui',
                        fontSize: 18,
                        fontWeight: 800,
                        color: colors.fg,
                        lineHeight: 1.12,
                        marginTop: 1,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {item.body}
                </div>
            </div>
        </div>
    );
}

/* ── Travelling server paddle ──────────────────────────────────────────── */
interface ServerTokenLayerProps {
    team: TeamIdx;
    cellRight: boolean;
    flipRef: FlipRef;
    padding?: string;
    children: ReactNode;
}
export function ServerTokenLayer({ team, cellRight, flipRef, padding = '16px 0', children }: ServerTokenLayerProps) {
    const cell = (t: TeamIdx, right: boolean) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            {team === t && cellRight === right ? <div ref={flipRef}>{children}</div> : null}
        </div>
    );

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                padding,
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'none',
                zIndex: 5,
            }}
        >
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
                {cell(1, false)}
                {cell(1, true)}
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'end' }}>
                {cell(0, false)}
                {cell(0, true)}
            </div>
        </div>
    );
}

/* ── Court tap handlers ────────────────────────────────────────────────── */
type Fx = ReturnType<typeof useCourtFx>;

export function handleTapSingles(e: React.MouseEvent, m: MatchView, fx: Fx, colors: SkinFxColors) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const winner: TeamIdx = y < r.height / 2 ? 1 : 0;
    fx.ripple(x, y, colors.ripple);
    if (winner === m.server) fx.point(winner, colors.point);
    m.award(winner);
}

export function handleTapDoubles(e: React.MouseEvent, m: MatchView, fx: Fx, colors: SkinFxColors) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const winner: TeamIdx = y < r.height / 2 ? 1 : 0;
    fx.ripple(x, y, colors.ripple);
    if (winner === m.serverD.team) fx.point(winner, colors.point);
    m.award(winner);
}
