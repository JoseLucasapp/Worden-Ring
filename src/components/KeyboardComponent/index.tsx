import "./style.css";

type LetterStatus = "idle" | "correct" | "present" | "absent";

type Props = {
    onChar: (ch: string) => void;
    onEnter: () => void;
    onBackspace: () => void;
    keyStates?: Record<string, LetterStatus>;
    disabled?: boolean;
};

const LAYOUT: ReadonlyArray<ReadonlyArray<string>> = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "back"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "enter"],
    ["z", "x", "c", "v", "b", "n", "m"],
];

const KeyboardComponent = ({
    onChar, onEnter, onBackspace, keyStates = {}, disabled = false
}: Props) => {
    return (
        <div className="keyboard">
            {LAYOUT.map((row, i) => (
                <div key={i} className="keyboard-row">
                    {row.map((k) => {
                        const isAction = k === "enter" || k === "back";
                        const label = k === "enter" ? "↵" : k === "back" ? "⌫" : k.toUpperCase();
                        const state: LetterStatus = !isAction ? (keyStates[k] ?? "idle") : "idle";

                        return (
                            <button
                                type="button"
                                key={k}
                                className="key elden-btn"
                                data-state={state}
                                data-action={isAction ? "true" : "false"}
                                disabled={disabled}
                                aria-label={`key-${label}`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    if (k === "enter") return onEnter();
                                    if (k === "back") return onBackspace();
                                    onChar(k);
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default KeyboardComponent;
