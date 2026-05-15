import { useEffect, useRef, useState } from 'react';

interface InlineEditProps {
    /** The current value to display when not editing. */
    value: string;
    /** Called with the trimmed input value when the edit is committed. */
    onCommit: (next: string) => void;
    /** Renders the read-only display state. */
    renderDisplay: (props: { value: string; startEdit: () => void }) => React.ReactNode;
    /** className applied to the <input> when editing. */
    inputClassName?: string;
    maxLength?: number;
}

/**
 * Click-to-edit primitive shared by team and player name labels.
 * Commits on Enter or blur, cancels on Escape.
 */
export function InlineEdit({
    value,
    onCommit,
    renderDisplay,
    inputClassName,
    maxLength = 20,
}: InlineEditProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    const startEdit = () => {
        setDraft(value);
        setEditing(true);
    };

    const commit = () => {
        if (!editing) {
            return;
        }
        setEditing(false);
        onCommit(draft);
    };

    const cancel = () => {
        setEditing(false);
        setDraft(value);
    };

    if (editing) {
        return (
            <input
                ref={inputRef}
                className={inputClassName}
                value={draft}
                maxLength={maxLength}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        commit();
                    } else if (e.key === 'Escape') {
                        cancel();
                    }
                }}
            />
        );
    }

    return <>{renderDisplay({ value, startEdit })}</>;
}
