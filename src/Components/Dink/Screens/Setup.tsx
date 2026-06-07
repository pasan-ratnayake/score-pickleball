/* Setup.tsx — New Match setup: format, players (autocomplete), game-to, win-by-2. */

import { useState } from 'react';

import type { DoublesNames, Mode, Pair, Target } from '../../../Types/Game';
import { AutocompleteField } from '../Autocomplete';
import { accentInk, T } from '../theme';
import { Btn, Icon, Label, Screen, Segmented, Toggle, TopBar } from '../UiKit';

export interface SetupInitial {
    mode: Mode;
    target: Target;
    winByTwo: boolean;
    singlesNames: Pair;
    doublesNames: DoublesNames;
}

export interface SetupResult {
    mode: Mode;
    names: Pair | DoublesNames;
    target: Target;
    winByTwo: boolean;
    singlesNames: Pair;
    doublesNames: DoublesNames;
}

interface SetupScreenProps {
    initial: SetupInitial;
    onBack: () => void;
    onStart: (result: SetupResult) => void;
}

const SINGLES_FALLBACK = ['You', 'Opponent'];
const DOUBLES_FALLBACK: DoublesNames = [
    ['You', 'Partner'],
    ['Theo', 'Mara'],
];

export function SetupScreen({ initial, onBack, onStart }: SetupScreenProps) {
    const [mode, setMode] = useState<Mode>(initial.mode);
    const [s, setS] = useState<Pair>(initial.singlesNames);
    const [d, setD] = useState<DoublesNames>(initial.doublesNames);
    const [target, setTarget] = useState<Target>(initial.target);
    const [winByTwo, setWinByTwo] = useState(initial.winByTwo);

    const start = () => {
        const clean: Pair | DoublesNames =
            mode === 'singles'
                ? (s.map((n, i) => n.trim() || SINGLES_FALLBACK[i]) as Pair)
                : (d.map((tm, ti) => tm.map((n, i) => n.trim() || DOUBLES_FALLBACK[ti][i]) as Pair) as DoublesNames);
        onStart({ mode, names: clean, target, winByTwo, singlesNames: s, doublesNames: d });
    };

    return (
        <Screen>
            <TopBar title="New match" onBack={onBack} />

            <Label>Format</Label>
            <Segmented
                value={mode}
                onChange={setMode}
                options={[
                    { value: 'singles', label: 'Singles' },
                    { value: 'doubles', label: 'Doubles' },
                ]}
            />

            <Label style={{ marginTop: 22 }}>Players</Label>
            {mode === 'singles' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <AutocompleteField value={s[0]} onChange={(v) => setS([v, s[1]])} placeholder="You" exclude={[s[1]]} />
                    <div
                        style={{
                            textAlign: 'center',
                            fontFamily: T.display,
                            fontWeight: 800,
                            fontSize: 12,
                            color: T.muted,
                            letterSpacing: '.14em',
                        }}
                    >
                        VS
                    </div>
                    <AutocompleteField value={s[1]} onChange={(v) => setS([s[0], v])} placeholder="Opponent" exclude={[s[0]]} />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <TeamFields label="Team 1" names={d[0]} others={d[1]} onChange={(t) => setD([t, d[1]])} />
                    <TeamFields label="Team 2" names={d[1]} others={d[0]} onChange={(t) => setD([d[0], t])} />
                </div>
            )}

            <Label style={{ marginTop: 22 }}>Game to</Label>
            <Segmented
                value={target}
                onChange={setTarget}
                options={[
                    { value: 11, label: '11' },
                    { value: 15, label: '15' },
                    { value: 21, label: '21' },
                ]}
            />

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 16,
                    padding: '4px 2px',
                }}
            >
                <div>
                    <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 14.5, color: T.ink }}>Win by 2</div>
                    <div style={{ fontFamily: T.body, fontSize: 12.5, color: T.muted }}>
                        Keep playing until a 2-point lead
                    </div>
                </div>
                <Toggle on={winByTwo} onChange={setWinByTwo} />
            </div>

            <div style={{ marginTop: 26 }}>
                <Btn onClick={start} style={{ fontSize: 17, padding: '18px 22px' }}>
                    {Icon.bolt({ s: 18, c: accentInk })} Start match
                </Btn>
            </div>
        </Screen>
    );
}

interface TeamFieldsProps {
    label: string;
    names: Pair;
    others?: string[];
    onChange: (names: Pair) => void;
}
function TeamFields({ label, names, others = [], onChange }: TeamFieldsProps) {
    return (
        <div>
            <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 12.5, color: T.ink, marginBottom: 7 }}>
                {label}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <AutocompleteField
                    value={names[0]}
                    onChange={(v) => onChange([v, names[1]])}
                    placeholder="Player 1"
                    exclude={[names[1], ...others]}
                />
                <AutocompleteField
                    value={names[1]}
                    onChange={(v) => onChange([names[0], v])}
                    placeholder="Player 2"
                    exclude={[names[0], ...others]}
                />
            </div>
        </div>
    );
}
