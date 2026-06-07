/* DinkApp.tsx — the Dink app shell: screen routing, accent theming, settings
 * + history persistence, match lifecycle. Rendered full-screen at "/". */

import './dink.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useDocumentTitle } from '../../Hooks/useDocumentTitle';
import { useHistoryStore } from '../../Stores/useHistoryStore';
import { useMatchStore } from '../../Stores/useMatchStore';
import { useSettingsStore } from '../../Stores/useSettingsStore';
import type { MatchRecord } from '../../Types/Game';
import { CompleteScreen } from './Screens/Complete';
import { HistoryScreen } from './Screens/History';
import { HomeScreen } from './Screens/Home';
import { PlayScreen } from './Screens/Play';
import { SettingsScreen } from './Screens/Settings';
import type { SetupResult } from './Screens/Setup';
import { SetupScreen } from './Screens/Setup';
import { SKINS } from './skins';
import { PALETTES, SPEEDS, T } from './theme';
import { AppFrame } from './UiKit';

type ScreenName = 'home' | 'setup' | 'play' | 'complete' | 'history' | 'settings';

export function DinkApp() {
    useDocumentTitle('Dink · Pickleball Scorekeeper');
    const navigate = useNavigate();

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

    // Apply the accent theme to the CSS vars the whole app reads.
    useEffect(() => {
        const p = PALETTES[settings.accent] || PALETTES.green;
        document.documentElement.style.setProperty('--accent', p.c);
        document.documentElement.style.setProperty('--accent-ink', p.ink);
    }, [settings.accent]);

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

    let body: React.ReactNode = null;
    if (screen === 'home')
        body = (
            <HomeScreen
                history={matches}
                onNew={() => setScreen('setup')}
                onHistory={() => setScreen('history')}
                onOpenSettings={() => setScreen('settings')}
            />
        );
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
        body = (
            <SettingsScreen
                settings={settings}
                onChange={(patch) => settings.update(patch)}
                onBack={() => setScreen('home')}
                onOpenRules={() => navigate('/rules')}
            />
        );
    else body = <HomeScreen history={matches} onNew={() => setScreen('setup')} onHistory={() => setScreen('history')} onOpenSettings={() => setScreen('settings')} />;

    const screenBg = screen === 'complete' ? T.ink : screen === 'play' ? skin.screenBg : T.bg;

    return <AppFrame screenBg={screenBg}>{body}</AppFrame>;
}
