/* Overlays.tsx — win overlay + leave/restart confirm dialog for the scoreboard. */

import type { MatchView } from '../../Stores/useMatchStore';
import type { DoublesNames, Pair } from '../../Types/Game';
import type { Skin } from './skins';

interface WinOverlayProps {
    m: MatchView;
    skin: Skin;
    onFinish: () => void;
}
export function WinOverlay({ m, skin, onFinish }: WinOverlayProps) {
    const winner = m.winner!;
    const winName =
        m.mode === 'singles'
            ? (m.names as Pair)[winner]
            : (m.names as DoublesNames)[winner].join(' & ');

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 8,
                background: 'rgba(20,24,26,.46)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                padding: 24,
            }}
        >
            <div
                style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '.18em',
                    textTransform: 'uppercase',
                    color: skin.overlayInk,
                }}
            >
                Game · {m.score[winner]}–{m.score[1 - winner]}
            </div>
            <div
                style={{
                    fontSize: 30,
                    fontWeight: 900,
                    color: '#fff',
                    textAlign: 'center',
                    lineHeight: 1.05,
                    fontFamily: '"Bricolage Grotesque", system-ui',
                    animation: 'dinkPop .5s cubic-bezier(.3,1.3,.5,1) both',
                }}
            >
                {winName}
                <br />
                <span style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,.8)' }}>wins it</span>
            </div>
            <button
                onClick={onFinish}
                style={{
                    marginTop: 6,
                    background: skin.accent,
                    color: skin.accentInk,
                    border: 0,
                    borderRadius: 999,
                    padding: '13px 26px',
                    fontSize: 15,
                    fontWeight: 800,
                    fontFamily: '"Bricolage Grotesque", system-ui',
                    cursor: 'pointer',
                    boxShadow: '0 6px 0 rgba(0,0,0,.2)',
                }}
            >
                See result →
            </button>
        </div>
    );
}

interface ConfirmDialogProps {
    skin: Skin;
    title: string;
    body: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
}
export function ConfirmDialog({ skin, title, body, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
    const dark = skin.id === 'paper' ? '#2A2520' : '#14181A';

    return (
        <div
            onClick={onCancel}
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 30,
                background: 'rgba(20,24,26,.5)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 26,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                style={{
                    width: '100%',
                    maxWidth: 320,
                    background: '#fff',
                    borderRadius: 22,
                    padding: '24px 22px 18px',
                    boxShadow: '0 24px 60px rgba(0,0,0,.4)',
                    textAlign: 'center',
                    fontFamily: '"Bricolage Grotesque", "Inter Tight", system-ui',
                    animation: 'dinkPop .32s cubic-bezier(.3,1.3,.5,1) both',
                }}
            >
                <div style={{ fontWeight: 900, fontSize: 21, color: '#14181A', letterSpacing: '-0.01em' }}>
                    {title}
                </div>
                <div
                    style={{
                        fontFamily: '"Inter Tight", system-ui',
                        fontSize: 14.5,
                        fontWeight: 500,
                        color: '#5A6065',
                        marginTop: 8,
                        lineHeight: 1.4,
                    }}
                >
                    {body}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                    <button
                        onClick={onCancel}
                        className="dink-btn"
                        style={{
                            flex: 1,
                            border: 0,
                            cursor: 'pointer',
                            borderRadius: 999,
                            padding: '13px 0',
                            background: '#EEF1EC',
                            color: '#14181A',
                            fontFamily: 'inherit',
                            fontWeight: 800,
                            fontSize: 15,
                            boxShadow: '0 2px 0 rgba(20,24,26,.1)',
                        }}
                    >
                        Keep playing
                    </button>
                    <button
                        onClick={onConfirm}
                        className="dink-btn"
                        style={{
                            flex: 1,
                            border: 0,
                            cursor: 'pointer',
                            borderRadius: 999,
                            padding: '13px 0',
                            background: dark,
                            color: '#fff',
                            fontFamily: 'inherit',
                            fontWeight: 800,
                            fontSize: 15,
                            boxShadow: '0 3px 0 rgba(0,0,0,.22)',
                        }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
