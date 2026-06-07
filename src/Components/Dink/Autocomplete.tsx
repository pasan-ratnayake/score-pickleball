/* Autocomplete.tsx — setup name field with a recents dropdown.
 * Type freely, or pick a catalogued player. `exclude` hides names already
 * chosen elsewhere in this match. */

import { useEffect, useMemo, useRef, useState } from 'react';

import { useHistoryStore } from '../../Stores/useHistoryStore';
import { rosterSuggestions } from '../../Utils/roster';
import { accent, T } from './theme';

interface AutocompleteFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    exclude?: string[];
}

export function AutocompleteField({ value, onChange, placeholder, exclude }: AutocompleteFieldProps) {
    const roster = useHistoryStore((s) => s.roster);
    const [open, setOpen] = useState(false);
    const [hi, setHi] = useState(-1);
    const wrapRef = useRef<HTMLDivElement>(null);
    const exKey = (exclude || []).join('|');

    const sugg = useMemo(
        () => (open ? rosterSuggestions(roster, value, exclude) : []),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [open, value, exKey, roster]
    );

    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', h);

        return () => document.removeEventListener('mousedown', h);
    }, [open]);
    useEffect(() => {
        setHi(-1);
    }, [value, open]);

    const choose = (name: string) => {
        onChange(name);
        setOpen(false);
    };
    const onKey = (e: React.KeyboardEvent) => {
        if (!open || !sugg.length) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHi((h) => (h + 1) % sugg.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHi((h) => (h <= 0 ? sugg.length - 1 : h - 1));
        } else if (e.key === 'Enter' && hi >= 0) {
            e.preventDefault();
            choose(sugg[hi]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };
    const empty = !(value || '').trim();

    return (
        <div ref={wrapRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <input
                value={value}
                autoComplete="off"
                spellCheck={false}
                className="ex-edit-name"
                placeholder={placeholder}
                onChange={(e) => {
                    onChange(e.target.value.slice(0, 18));
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onKeyDown={onKey}
                style={{
                    width: '100%',
                    border: `1.5px solid ${T.line}`,
                    borderRadius: 13,
                    padding: '13px 14px',
                    fontFamily: T.display,
                    fontWeight: 700,
                    fontSize: 15.5,
                    color: T.ink,
                    background: T.card,
                    outline: 'none',
                }}
            />
            {open && sugg.length > 0 && (
                <div
                    role="listbox"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        right: 0,
                        zIndex: 30,
                        background: T.card,
                        border: `1px solid ${T.line}`,
                        borderRadius: 13,
                        boxShadow: '0 14px 32px rgba(20,24,26,.18)',
                        overflow: 'hidden',
                        padding: 5,
                    }}
                >
                    {empty && (
                        <div
                            style={{
                                fontFamily: T.display,
                                fontWeight: 800,
                                fontSize: 10.5,
                                letterSpacing: '.12em',
                                textTransform: 'uppercase',
                                color: T.muted,
                                padding: '6px 10px 4px',
                            }}
                        >
                            Recent players
                        </div>
                    )}
                    {sugg.map((name, i) => (
                        <button
                            key={name}
                            type="button"
                            role="option"
                            aria-selected={i === hi}
                            onMouseDown={(e) => e.preventDefault()}
                            onMouseEnter={() => setHi(i)}
                            onClick={() => choose(name)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                width: '100%',
                                border: 0,
                                cursor: 'pointer',
                                textAlign: 'left',
                                borderRadius: 9,
                                background:
                                    i === hi ? 'color-mix(in oklch, var(--accent) 13%, transparent)' : 'transparent',
                                padding: '9px 10px',
                                fontFamily: T.body,
                                fontWeight: 700,
                                fontSize: 14.5,
                                color: T.ink,
                            }}
                        >
                            <span
                                style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: '50%',
                                    flexShrink: 0,
                                    background: T.soft,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: T.display,
                                    fontWeight: 800,
                                    fontSize: 12,
                                    color: accent,
                                }}
                            >
                                {(name.trim()[0] || '·').toUpperCase()}
                            </span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {name}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
