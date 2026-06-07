import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
    AccentKey,
    DoublesNames,
    Mode,
    Pair,
    PaperAccentKey,
    SkinId,
    Speed,
    Target,
} from '../Types/Game';

export interface Settings {
    accent: AccentKey;
    paperAccent: PaperAccentKey;
    courtStyle: SkinId;
    speed: Speed;
    target: Target;
    winByTwo: boolean;
    lastMode: Mode;
    singlesNames: Pair;
    doublesNames: DoublesNames;
}

interface SettingsStore extends Settings {
    update: (patch: Partial<Settings>) => void;
}

const DEFAULTS: Settings = {
    accent: 'green',
    paperAccent: 'rust',
    courtStyle: 'court',
    speed: 'default',
    target: 11,
    winByTwo: true,
    lastMode: 'singles',
    singlesNames: ['You', 'Riley'],
    doublesNames: [
        ['You', 'Sam'],
        ['Theo', 'Mara'],
    ],
};

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            ...DEFAULTS,
            update: (patch) => set(patch),
        }),
        { name: 'dink-settings-v1' }
    )
);
