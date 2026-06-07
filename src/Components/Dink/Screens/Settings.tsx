/* Settings.tsx — accent theme, court style (5 skins), motion speed, defaults,
 * plus a link to the Rules reference. All live + persisted. */

import type { Settings } from '../../../Stores/useSettingsStore';
import type { AccentKey, SkinId } from '../../../Types/Game';
import { Paddle } from '../Atoms';
import { SKIN_ORDER, SKINS } from '../skins';
import { accent, accentInk, PALETTES, T } from '../theme';
import { Card, chrome, Label, Screen, Segmented, Toggle, TopBar } from '../UiKit';

interface SettingsScreenProps {
    settings: Settings;
    onChange: (patch: Partial<Settings>) => void;
    onBack: () => void;
    onOpenRules: () => void;
}
export function SettingsScreen({ settings, onChange, onBack, onOpenRules }: SettingsScreenProps) {
    const set = (patch: Partial<Settings>) => onChange(patch);

    return (
        <Screen>
            <TopBar title="Settings" onBack={onBack} />

            <Label>Accent</Label>
            <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
                {(Object.entries(PALETTES) as [AccentKey, (typeof PALETTES)[AccentKey]][]).map(([key, p]) => {
                    const on = settings.accent === key;

                    return (
                        <button
                            key={key}
                            onClick={() => set({ accent: key })}
                            aria-label={p.label}
                            style={{
                                flex: 1,
                                border: 0,
                                cursor: 'pointer',
                                background: 'transparent',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            <span
                                style={{
                                    width: '100%',
                                    height: 46,
                                    borderRadius: 14,
                                    background: p.c,
                                    boxShadow: on ? `0 0 0 3px ${T.bg}, 0 0 0 5px ${p.c}` : '0 2px 0 rgba(20,24,26,.1)',
                                    transition: 'box-shadow .15s ease',
                                }}
                            />
                            <span style={{ fontFamily: T.body, fontWeight: 700, fontSize: 12, color: on ? T.ink : T.muted }}>
                                {p.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <Label>Court style</Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 22 }}>
                {SKIN_ORDER.map((key: SkinId) => {
                    const sk = SKINS[key];
                    const on = (settings.courtStyle || 'court') === key;

                    return (
                        <button
                            key={key}
                            onClick={() => set({ courtStyle: key })}
                            aria-label={sk.label}
                            style={{
                                border: 0,
                                cursor: 'pointer',
                                background: 'transparent',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            <span
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: 52,
                                    borderRadius: 12,
                                    background: sk.swatch,
                                    border: key === 'paper' ? '1px solid rgba(20,24,26,.14)' : '0',
                                    boxShadow: on ? `0 0 0 3px ${T.bg}, 0 0 0 5px ${T.ink}` : '0 2px 0 rgba(20,24,26,.1)',
                                    transition: 'box-shadow .15s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {sk.swatchDot && (
                                    <span style={{ width: 13, height: 13, borderRadius: '50%', background: sk.swatchDot }} />
                                )}
                            </span>
                            <span style={{ fontFamily: T.body, fontWeight: 700, fontSize: 11.5, color: on ? T.ink : T.muted }}>
                                {sk.label}
                            </span>
                        </button>
                    );
                })}
            </div>
            <Segmented
                value={settings.speed}
                onChange={(v) => set({ speed: v })}
                options={[
                    { value: 'calm', label: 'Calm' },
                    { value: 'default', label: 'Default' },
                    { value: 'snappy', label: 'Snappy' },
                ]}
            />

            <Label style={{ marginTop: 22 }}>Default game to</Label>
            <Segmented
                value={settings.target}
                onChange={(v) => set({ target: v })}
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
                    marginTop: 18,
                    padding: '2px',
                }}
            >
                <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 14.5, color: T.ink }}>
                    Win by 2 by default
                </div>
                <Toggle on={settings.winByTwo} onChange={(v) => set({ winByTwo: v })} />
            </div>

            <Card
                onClick={onOpenRules}
                style={{ marginTop: 18, padding: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            >
                <div
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        background: T.soft,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: accent,
                        fontSize: 18,
                    }}
                >
                    📖
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 14, color: T.ink }}>
                        Rules &amp; scoring
                    </div>
                    <div style={{ fontFamily: T.body, fontSize: 12.5, color: T.muted }}>
                        How serving, side-outs and the kitchen work.
                    </div>
                </div>
                <span style={{ ...chrome(T.muted), width: 'auto', height: 'auto', fontSize: 22 }}>›</span>
            </Card>

            <Card style={{ marginTop: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        background: accent,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Paddle size={16} color={accentInk} />
                </div>
                <div>
                    <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 14, color: T.ink }}>Dink · v1</div>
                    <div style={{ fontFamily: T.body, fontSize: 12.5, color: T.muted }}>
                        A friendlier way to keep score.
                    </div>
                </div>
            </Card>
        </Screen>
    );
}
