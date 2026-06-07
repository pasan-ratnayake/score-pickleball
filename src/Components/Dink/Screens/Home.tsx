/* Home.tsx — Dink wordmark, hero line, New Match CTA, recent matches. */

import type { MatchRecord } from '../../../Types/Game';
import { Paddle } from '../Atoms';
import { accent, accentInk, T } from '../theme';
import { Btn, Card, chrome, Icon, Screen } from '../UiKit';
import { MatchRow } from './MatchRow';

interface HomeScreenProps {
    history: MatchRecord[];
    onNew: () => void;
    onHistory: () => void;
    onOpenSettings: () => void;
}
export function HomeScreen({ history, onNew, onHistory, onOpenSettings }: HomeScreenProps) {
    const recent = history.slice(0, 3);
    const played = history.length;

    return (
        <Screen>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 11,
                            background: accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Paddle size={15} color={accentInk} />
                    </div>
                    <span
                        style={{
                            fontFamily: T.display,
                            fontWeight: 900,
                            fontSize: 23,
                            letterSpacing: '-0.02em',
                            color: T.ink,
                        }}
                    >
                        Dink
                    </span>
                </div>
                <button onClick={onOpenSettings} aria-label="Settings" style={chrome(T.muted)}>
                    <span style={{ fontSize: 20 }}>⚙</span>
                </button>
            </div>

            <div style={{ marginTop: 26 }}>
                <div
                    style={{
                        fontFamily: T.display,
                        fontWeight: 900,
                        fontSize: 34,
                        lineHeight: 1.05,
                        letterSpacing: '-0.02em',
                        color: T.ink,
                        textWrap: 'balance',
                    }}
                >
                    Keep score,
                    <br />
                    not the arguments.
                </div>
                <div style={{ fontFamily: T.body, fontSize: 15, color: T.muted, marginTop: 10, fontWeight: 500 }}>
                    Tap the court to score. Dink tracks serving, side-outs and the win.
                </div>
            </div>

            <div style={{ marginTop: 22 }}>
                <Btn onClick={onNew} style={{ fontSize: 17, padding: '18px 22px' }}>
                    {Icon.plus({ s: 20, c: accentInk })} New match
                </Btn>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '28px 0 12px' }}>
                <span style={{ fontFamily: T.display, fontWeight: 800, fontSize: 15, color: T.ink }}>Recent</span>
                {played > 0 && (
                    <button
                        onClick={onHistory}
                        style={{
                            background: 'none',
                            border: 0,
                            cursor: 'pointer',
                            fontFamily: T.body,
                            fontWeight: 700,
                            fontSize: 13,
                            color: accent,
                        }}
                    >
                        View all
                    </button>
                )}
            </div>

            {recent.length === 0 ? (
                <Card style={{ padding: '30px 22px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, opacity: 0.5 }}>
                        {Icon.clock({ s: 26, c: T.muted })}
                    </div>
                    <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 15, color: T.ink }}>No games yet</div>
                    <div style={{ fontFamily: T.body, fontSize: 13.5, color: T.muted, marginTop: 4 }}>
                        Your finished matches show up here.
                    </div>
                </Card>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recent.map((rec) => (
                        <MatchRow key={rec.id} rec={rec} onClick={onHistory} />
                    ))}
                </div>
            )}
        </Screen>
    );
}
