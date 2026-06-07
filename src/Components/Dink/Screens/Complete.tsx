/* Complete.tsx — match-complete celebration: winner, final score, quick stats. */

import type { ReactNode } from 'react';

import type { MatchRecord } from '../../../Types/Game';
import { Paddle } from '../Atoms';
import { fmtDur, recName } from '../format';
import { accent, accentInk, T } from '../theme';
import { Btn } from '../UiKit';

interface CompleteScreenProps {
    rec: MatchRecord;
    onRematch: () => void;
    onNew: () => void;
    onHome: () => void;
}
export function CompleteScreen({ rec, onRematch, onNew, onHome }: CompleteScreenProps) {
    const w = rec.winner;
    const l = (1 - w) as 0 | 1;

    return (
        <div
            className="dink-screen"
            style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                background: T.ink,
                animation: 'screenIn .34s cubic-bezier(.25,1,.4,1) both',
                overflow: 'hidden',
            }}
        >
            {/* celebratory court glow */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: -120,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 460,
                    height: 460,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    background: 'radial-gradient(circle, rgba(46,125,82,.55) 0%, transparent 65%)',
                }}
            />
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    padding: 'max(20px, env(safe-area-inset-top)) 24px max(26px, env(safe-area-inset-bottom))',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                    }}
                >
                    <div
                        style={{
                            fontFamily: T.display,
                            fontWeight: 800,
                            fontSize: 12.5,
                            letterSpacing: '.2em',
                            textTransform: 'uppercase',
                            color: '#FFB300',
                            marginBottom: 4,
                        }}
                    >
                        Final · {rec.mode === 'singles' ? 'Singles' : 'Doubles'}
                    </div>
                    <div
                        style={{
                            width: 70,
                            height: 70,
                            borderRadius: 22,
                            background: accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 8,
                            boxShadow: '0 10px 30px rgba(0,0,0,.4)',
                            animation: 'dinkPop .5s cubic-bezier(.3,1.3,.5,1) both',
                        }}
                    >
                        <Paddle size={30} color={accentInk} />
                    </div>
                    <div
                        style={{
                            fontFamily: T.display,
                            fontWeight: 900,
                            fontSize: 30,
                            color: '#fff',
                            textAlign: 'center',
                            lineHeight: 1.06,
                            letterSpacing: '-0.01em',
                            textWrap: 'balance',
                        }}
                    >
                        {recName(rec, w)}
                    </div>
                    <div style={{ fontFamily: T.body, fontWeight: 600, fontSize: 15, color: 'rgba(255,255,255,.7)' }}>
                        takes the game
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, margin: '22px 0 6px' }}>
                        <ScorePill v={rec.score[w]} active />
                        <span
                            style={{
                                fontFamily: T.display,
                                fontWeight: 800,
                                fontSize: 22,
                                color: 'rgba(255,255,255,.4)',
                                paddingBottom: 14,
                            }}
                        >
                            –
                        </span>
                        <ScorePill v={rec.score[l]} />
                    </div>
                    <div style={{ display: 'flex', gap: 22, marginTop: 12 }}>
                        <Stat label="Points" value={rec.score[0] + rec.score[1]} />
                        <Stat label="Duration" value={fmtDur(rec.durationMs)} />
                        <Stat label="Game to" value={rec.target} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
                    <Btn onClick={onRematch} style={{ fontSize: 16 }}>
                        Rematch
                    </Btn>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Btn kind="ghost" onClick={onNew} style={{ color: '#fff', borderColor: 'rgba(255,255,255,.22)' }}>
                            New match
                        </Btn>
                        <Btn kind="ghost" onClick={onHome} style={{ color: '#fff', borderColor: 'rgba(255,255,255,.22)' }}>
                            Home
                        </Btn>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ScorePill({ v, active }: { v: number; active?: boolean }) {
    return (
        <div
            style={{
                fontFamily: T.display,
                fontWeight: 900,
                fontVariantNumeric: 'tabular-nums',
                fontSize: 76,
                lineHeight: 0.9,
                color: active ? '#fff' : 'rgba(255,255,255,.34)',
                animation: 'dinkPop .55s cubic-bezier(.3,1.3,.5,1) both',
            }}
        >
            {v}
        </div>
    );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div
                style={{
                    fontFamily: T.display,
                    fontWeight: 900,
                    fontSize: 18,
                    color: '#fff',
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {value}
            </div>
            <div
                style={{
                    fontFamily: T.body,
                    fontWeight: 600,
                    fontSize: 11,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,.5)',
                    marginTop: 2,
                }}
            >
                {label}
            </div>
        </div>
    );
}
