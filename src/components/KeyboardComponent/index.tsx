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

const colorFor = (state: LetterStatus) => {
    switch (state) {
        case "correct": return { bg: "#16a34a", fg: "#ffffff", border: "#16a34a" };
        case "present": return { bg: "#f59e0b", fg: "#ffffff", border: "#f59e0b" };
        case "absent": return { bg: "#9ca3af", fg: "#ffffff", border: "#9ca3af" };
        default: return { bg: "#ffffff", fg: "#000000", border: "transparent" };
    }
};

const baseStyle: React.CSSProperties = {
    height: 50,
    width: 50,
    fontSize: 20,
    padding: "0 10px",
    borderRadius: 8,
    border: "1px solid transparent",
    cursor: "pointer",
    userSelect: "none",
};

const getKeyStyle = (state: LetterStatus, isAction: boolean): React.CSSProperties => {
    const c = colorFor(state);
    return {
        ...baseStyle,
        background: c.bg,
        color: c.fg,
        borderColor: c.border,
        width: isAction ? 72 : baseStyle.width,
    };
};

const KeyboardComponent = ({
    onChar, onEnter, onBackspace, keyStates = {}, disabled = false
}: Props) => {
    return (
        <div style={{ display: "grid", gap: 8 }}>
            {LAYOUT.map((row, i) => (
                <div key={i} style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    {row.map((k) => {
                        const isAction = k === "enter" || k === "back";
                        const label = k === "enter" ? "↵" : k === "back" ? "⌫" : k.toUpperCase();
                        const state: LetterStatus = !isAction ? (keyStates[k] ?? "idle") : "idle";
                        const style = getKeyStyle(state, isAction);

                        return (
                            <button
                                type="button"
                                key={k}
                                disabled={disabled}
                                onClick={() => {
                                    if (k === "enter") return onEnter();
                                    if (k === "back") return onBackspace();
                                    onChar(k);
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                aria-label={`key-${label}`}
                                style={{
                                    ...style,
                                    opacity: disabled ? 0.6 : 1,
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
