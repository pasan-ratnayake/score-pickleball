/* DinkApp.tsx — the Dink app shell: screen routing, per-style theming, settings
 * + history persistence, match lifecycle. Rendered full-screen at "/".
 *
 * The selected Court Style themes the WHOLE app: this writes the style's tokens
 * to `--app-*` and the resolved accent to `--accent`, which `theme.ts` reads. */

import './dink.css';

import { useEffect, useState } from 'react';

import { useDocumentTitle } from '../../Hooks/useDocumentTitle';
import { useHistoryStore } from '../../Stores/useHistoryStore';
import { useMatchStore } from '../../Stores/useMatchStore';
import { useSettingsStore } from '../../Stores/useSettingsStore';
import type { MatchRecord } from '../../Types/Game';
import { RulesScreen } from './Rules';
import { CompleteScreen } from './Screens/Complete';
import { HistoryScreen } from './Screens/History';
import { HomeScreen } from './Screens/Home';
import { PlayScreen } from './Screens/Play';
import { SettingsScreen } from './Screens/Settings';
import type { SetupResult } from './Screens/Setup';
import { SetupScreen } from './Screens/Setup';
import { SKINS } from './skins';
import { APP_THEMES, resolveAccent, SPEEDS, T } from './theme';
import { AppFrame } from './UiKit';

type ScreenName = 'home' | 'rules' | 'setup' | 'play' | 'complete' | 'history' | 'settings';

export function DinkApp() {
    useDocumentTitle('Dink · Pickleball Scorekeeper');

    const settings = useSettingsStore();
    const matches = useHistoryStore((s) => s.matches);
    const addMatch = useHistoryStore((s) => s.addMatch);
    const clearMatches = useHistoryStore((s) => s.clearMatches);
    const seedRoster = useHistoryStore((s) => s.seedRoster);

    const startMatch = useMatchStore((s) => s.start);
    const resetMatch = useMatchStore((s) => s.reset);
    const recordMatch = useMatchStore((s) => s.record);

    const [screen, setScreen] = useState<ScreenName>('home');
    const [result, setResult] = useState<MatchRecord | null>(null);

    // The Court Style themes the whole app: write its tokens + accent to CSS vars.
    useEffect(() => {
        const a = resolveAccent(settings);
        const th = APP_THEMES[settings.courtStyle] || APP_THEMES.court;
        const root = document.documentElement.style;
        root.setProperty('--accent', a.c);
        root.setProperty('--accent-ink', a.ink);
        root.setProperty('--app-bg', th.bg);
        root.setProperty('--app-card', th.card);
        root.setProperty('--app-ink', th.ink);
        root.setProperty('--app-muted', th.muted);
        root.setProperty('--app-line', th.line);
        root.setProperty('--app-soft', th.soft);
        root.setProperty('--app-frame', th.frame);
        root.setProperty('--app-celebrate', th.celebrate);
        root.setProperty('--app-card-blur', th.blur);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings.courtStyle, settings.accent, settings.paperAccent]);

    // One-time: backfill the player catalogue from past matches.
    useEffect(() => {
        seedRoster();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const skin = SKINS[settings.courtStyle] || SKINS.court;
    const flipMs = SPEEDS[settings.speed] || 460;

    const handleStart = (cfg: SetupResult) => {
        settings.update({
            lastMode: cfg.mode,
            singlesNames: cfg.singlesNames,
            doublesNames: cfg.doublesNames,
            target: cfg.target,
            winByTwo: cfg.winByTwo,
        });
        startMatch({ mode: cfg.mode, names: cfg.names, target: cfg.target, winByTwo: cfg.winByTwo });
        setScreen('play');
    };

    const handleFinish = () => {
        const rec = recordMatch();
        if (rec) {
            addMatch(rec);
            setResult(rec);
        }
        setScreen('complete');
    };

    const handleRematch = () => {
        resetMatch();
        setScreen('play');
    };

    const setupInitial = {
        mode: settings.lastMode,
        target: settings.target,
        winByTwo: settings.winByTwo,
        singlesNames: settings.singlesNames,
        doublesNames: settings.doublesNames,
    };

    const home = (
        <HomeScreen
            history={matches}
            onNew={() => setScreen('setup')}
            onHistory={() => setScreen('history')}
            onRules={() => setScreen('rules')}
            onOpenSettings={() => setScreen('settings')}
        />
    );

    let body: React.ReactNode;
    if (screen === 'rules') body = <RulesScreen onBack={() => setScreen('home')} />;
    else if (screen === 'setup')
        body = <SetupScreen initial={setupInitial} onBack={() => setScreen('home')} onStart={handleStart} />;
    else if (screen === 'play')
        body = (
            <PlayScreen
                skin={skin}
                flipMs={flipMs}
                onExit={() => setScreen('home')}
                onNewMatch={() => setScreen('setup')}
                onFinish={handleFinish}
            />
        );
    else if (screen === 'complete' && result)
        body = (
            <CompleteScreen
                rec={result}
                onRematch={handleRematch}
                onNew={() => setScreen('setup')}
                onHome={() => setScreen('home')}
            />
        );
    else if (screen === 'history')
        body = <HistoryScreen history={matches} onBack={() => setScreen('home')} onClear={clearMatches} />;
    else if (screen === 'settings')
        body = <SettingsScreen settings={settings} onChange={(patch) => settings.update(patch)} onBack={() => setScreen('home')} />;
    else body = home;

    const screenBg = screen === 'complete' ? T.celebrate : screen === 'play' ? skin.screenBg : T.bg;

    return <AppFrame screenBg={screenBg}>{body}</AppFrame>;
}
