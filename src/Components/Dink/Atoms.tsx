/* Atoms.tsx — the paddle glyph + the inline-editable name input. */

import type { CSSProperties } from 'react';

interface PaddleProps {
    size?: number;
    color?: string;
    number?: number;
    inkColor?: string;
    style?: CSSProperties;
}

export function Paddle({ size = 20, color = 'currentColor', number, inkColor = '#fff', style }: PaddleProps) {
    return (
        <svg
            width={size}
            height={Math.round(size * 1.45)}
            viewBox="0 0 18 26"
            style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}
        >
            <rect x="0.6" y="0.6" width="16.8" height="17.6" rx="7.6" fill={color} />
            <rect x="7.4" y="18" width="3.2" height="2.4" fill={color} />
            <rect x="6" y="20.2" width="6" height="5.2" rx="1.5" fill={color} />
            {number != null && (
                <text
                    x="9"
                    y="13"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="800"
                    fill={inkColor}
                    fontFamily="inherit"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {number}
                </text>
            )}
        </svg>
    );
}

interface EditableNameProps {
    value: string;
    onChange: (value: string) => void;
    style?: CSSProperties;
    placeholder?: string;
    maxLength?: number;
}

export function EditableName({
    value,
    onChange,
    style,
    placeholder = 'Name',
    maxLength = 18,
}: EditableNameProps) {
    return (
        <input
            value={value}
            size={Math.max((value || '').length, (placeholder || '').length, 2)}
            onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
            onFocus={(e) => e.target.select()}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
            }}
            spellCheck={false}
            placeholder={placeholder}
            aria-label="Player name"
            className="ex-edit-name"
            style={{
                background: 'transparent',
                border: '1px solid transparent',
                outline: 'none',
                fontFamily: 'inherit',
                padding: '4px 10px',
                borderRadius: 8,
                textAlign: 'center',
                maxWidth: '100%',
                minWidth: 0,
                transition: 'border-color .15s ease, background .15s ease',
                ...style,
            }}
        />
    );
}
