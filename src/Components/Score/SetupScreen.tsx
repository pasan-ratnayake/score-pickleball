import './SetupScreen.css';

import { useState } from 'react';

import { useGameStore } from '../../Stores/useGameStore';
import type { Format, PlayTo } from '../../Types/Game';

export function SetupScreen() {
    const format = useGameStore((s) => s.format);
    const playTo = useGameStore((s) => s.playTo);
    const setFormat = useGameStore((s) => s.setFormat);
    const setPlayTo = useGameStore((s) => s.setPlayTo);
    const setName = useGameStore((s) => s.setName);
    const startGame = useGameStore((s) => s.startGame);

    const [nameA, setNameA] = useState('');
    const [nameB, setNameB] = useState('');

    const isDoubles = format === 'doubles';
    const labelA = isDoubles ? 'Team A name' : 'Player A name';
    const labelB = isDoubles ? 'Team B name' : 'Player B name';
    const placeholderA = isDoubles ? 'Team A' : 'Player A';
    const placeholderB = isDoubles ? 'Team B' : 'Player B';

    const handleStart = () => {
        setName('A', nameA);
        setName('B', nameB);
        startGame();
    };

    return (
        <div id="screen-setup">
            <h1 className="app-title">
                Pickleball<span className="title-accent">.</span>
            </h1>

            <div className="setup-card">
                <div>
                    <label className="field-label">Format</label>
                    <div className="toggle-group">
                        <FormatToggle value="singles" active={format} onChange={setFormat}>
                            Singles
                        </FormatToggle>
                        <FormatToggle value="doubles" active={format} onChange={setFormat}>
                            Doubles
                        </FormatToggle>
                    </div>
                </div>

                <div>
                    <label className="field-label">Play to</label>
                    <div className="toggle-group">
                        <PlayToToggle value={11} active={playTo} onChange={setPlayTo}>
                            11
                        </PlayToToggle>
                        <PlayToToggle value={21} active={playTo} onChange={setPlayTo}>
                            21
                        </PlayToToggle>
                    </div>
                </div>

                <div>
                    <div className="name-row">
                        <label htmlFor="name-a" className="name-label team-a-label">
                            {labelA}
                        </label>
                        <input
                            id="name-a"
                            className="name-input"
                            type="text"
                            placeholder={placeholderA}
                            maxLength={20}
                            autoComplete="off"
                            value={nameA}
                            onChange={(e) => setNameA(e.target.value)}
                        />
                    </div>
                    <div className="name-row">
                        <label htmlFor="name-b" className="name-label team-b-label">
                            {labelB}
                        </label>
                        <input
                            id="name-b"
                            className="name-input"
                            type="text"
                            placeholder={placeholderB}
                            maxLength={20}
                            autoComplete="off"
                            value={nameB}
                            onChange={(e) => setNameB(e.target.value)}
                        />
                    </div>
                </div>

                <button type="button" className="btn-primary" onClick={handleStart}>
                    Start Game
                </button>
            </div>
        </div>
    );
}

interface ToggleProps<T extends string | number> {
    value: T;
    active: T;
    onChange: (value: T) => void;
    children: React.ReactNode;
}

function FormatToggle({ value, active, onChange, children }: ToggleProps<Format>) {
    return (
        <button
            type="button"
            className={`toggle-btn ${value === active ? 'active' : ''}`}
            onClick={() => onChange(value)}
        >
            {children}
        </button>
    );
}

function PlayToToggle({ value, active, onChange, children }: ToggleProps<PlayTo>) {
    return (
        <button
            type="button"
            className={`toggle-btn ${value === active ? 'active' : ''}`}
            onClick={() => onChange(value)}
        >
            {children}
        </button>
    );
}
