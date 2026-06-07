import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AccentKey, DoublesNames, Mode, Pair, SkinId, Speed, Target } from '../Types/Game';

export interface Settings {
    accent: AccentKey;
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
