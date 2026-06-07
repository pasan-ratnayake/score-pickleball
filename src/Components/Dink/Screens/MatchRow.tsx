/* MatchRow.tsx — a finished-match summary row (Home + History). */

import type { MatchRecord } from '../../../Types/Game';
import { Paddle } from '../Atoms';
import { fmtDate, recName } from '../format';
import { accent, T } from '../theme';
import { Card } from '../UiKit';

interface MatchRowProps {
    rec: MatchRecord;
    onClick?: () => void;
}
export function MatchRow({ rec, onClick }: MatchRowProps) {
    const w = rec.winner;
    const l = (1 - w) as 0 | 1;

    return (
        <Card onClick={onClick} style={{ padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 13 }}>
            <div
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    flexShrink: 0,
                    background: T.soft,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: accent,
                }}
            >
                <Paddle size={16} color={accent} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontFamily: T.display,
                        fontWeight: 800,
                        fontSize: 14.5,
                        color: T.ink,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {recName(rec, w)} <span style={{ color: T.muted, fontWeight: 600 }}>def.</span> {recName(rec, l)}
                </div>
                <div style={{ fontFamily: T.body, fontSize: 12.5, color: T.muted, marginTop: 2 }}>
                    {rec.mode === 'singles' ? 'Singles' : 'Doubles'} · {fmtDate(rec.date)}
                </div>
            </div>
            <div
                style={{
                    fontFamily: T.display,
                    fontWeight: 900,
                    fontSize: 18,
                    color: T.ink,
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {rec.score[w]}
                <span style={{ color: T.muted }}>–{rec.score[l]}</span>
            </div>
        </Card>
    );
}
