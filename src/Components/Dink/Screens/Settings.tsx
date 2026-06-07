/* Settings.tsx — the Court Style IS the theme (re-skins the whole app). Below
 * it: an accent picker for the themeable styles (Court / Paper) or a "built-in
 * accent" note for the fixed ones (Neon / Glass / Split), then motion speed.
 * Per-match rules (game-to, win-by-2) live on the New-match screen, not here. */

import type { Settings } from '../../../Stores/useSettingsStore';
import type { AccentKey, PaperAccentKey, SkinId } from '../../../Types/Game';
import { Paddle } from '../Atoms';
import { SKIN_ORDER, SKINS } from '../skins';
import { accent, ACCENT_PICKERS, accentInk, FIXED_ACCENTS, T } from '../theme';
import { Card, Label, Screen, Segmented, TopBar } from '../UiKit';

interface SettingsScreenProps {
    settings: Settings;
    onChange: (patch: Partial<Settings>) => void;
    onBack: () => void;
}
export function SettingsScreen({ settings, onChange, onBack }: SettingsScreenProps) {
    const set = (patch: Partial<Settings>) => onChange(patch);
    const style = settings.courtStyle || 'court';
    const palette = ACCENT_PICKERS[style]; // undefined for fixed-accent styles
    const fixed = FIXED_ACCENTS[style];
    const accentVal = style === 'paper' ? settings.paperAccent : settings.accent;
    const pickAccent = (key: string) =>
        style === 'paper' ? set({ paperAccent: key as PaperAccentKey }) : set({ accent: key as AccentKey });

    return (
        <Screen>
            <TopBar title="Settings" onBack={onBack} />

            <Label>Theme</Label>
            <div style={{ fontFamily: T.body, fontSize: 12.5, color: T.muted, margin: '-4px 0 12px', fontWeight: 500 }}>
                Sets the court and the whole app.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
                {SKIN_ORDER.map((key: SkinId) => {
                    const sk = SKINS[key];
                    const on = style === key;

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
                                    boxShadow: on ? `0 0 0 3px ${T.bg}, 0 0 0 5px ${accent}` : '0 2px 0 rgba(20,24,26,.1)',
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

            <Label>Accent</Label>
            {palette ? (
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    {Object.entries(palette).map(([key, p]) => {
                        const on = (accentVal || Object.keys(palette)[0]) === key;

                        return (
                            <button
                                key={key}
                                onClick={() => pickAccent(key)}
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
                                        boxShadow: on
                                            ? `0 0 0 3px ${T.bg}, 0 0 0 5px ${p.c}`
                                            : '0 2px 0 rgba(20,24,26,.1)',
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
            ) : (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 11,
                        marginBottom: 24,
                        padding: '12px 14px',
                        background: T.soft,
                        borderRadius: 14,
                        border: `1px solid ${T.line}`,
                    }}
                >
                    <span
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 9,
                            background: fixed?.c,
                            flexShrink: 0,
                            border: '1px solid rgba(255,255,255,.25)',
                        }}
                    />
                    <span style={{ fontFamily: T.body, fontSize: 13, fontWeight: 600, color: T.muted }}>
                        The {SKINS[style].label} theme uses a built-in accent.
                    </span>
                </div>
            )}

            <Label>Animation speed</Label>
            <Segmented
                value={settings.speed}
                onChange={(v) => set({ speed: v })}
                options={[
                    { value: 'calm', label: 'Calm' },
                    { value: 'default', label: 'Default' },
                    { value: 'snappy', label: 'Snappy' },
                ]}
            />

            <Card style={{ marginTop: 26, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
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
