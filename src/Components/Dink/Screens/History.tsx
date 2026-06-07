/* History.tsx — every finished match, newest first (persisted). */

import type { MatchRecord } from '../../../Types/Game';
import { T } from '../theme';
import { Card, Icon, Screen, TopBar } from '../UiKit';
import { MatchRow } from './MatchRow';

interface HistoryScreenProps {
    history: MatchRecord[];
    onBack: () => void;
    onClear: () => void;
}
export function HistoryScreen({ history, onBack, onClear }: HistoryScreenProps) {
    return (
        <Screen>
            <TopBar
                title="History"
                onBack={onBack}
                right={
                    history.length > 0 ? (
                        <button
                            onClick={onClear}
                            style={{
                                background: 'none',
                                border: 0,
                                cursor: 'pointer',
                                fontFamily: T.body,
                                fontWeight: 700,
                                fontSize: 13,
                                color: T.muted,
                            }}
                        >
                            Clear
                        </button>
                    ) : undefined
                }
            />
            {history.length === 0 ? (
                <Card style={{ padding: '40px 22px', textAlign: 'center', marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.5 }}>
                        {Icon.list({ s: 28, c: T.muted })}
                    </div>
                    <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 16, color: T.ink }}>
                        Nothing here yet
                    </div>
                    <div style={{ fontFamily: T.body, fontSize: 13.5, color: T.muted, marginTop: 5 }}>
                        Play a match and it’ll be saved automatically.
                    </div>
                </Card>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {history.map((rec: MatchRecord) => (
                        <MatchRow key={rec.id} rec={rec} />
                    ))}
                </div>
            )}
        </Screen>
    );
}
