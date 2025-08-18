import { useEffect, useState, useRef } from 'react'
import './App.css'
import { data } from './data/words';
import ContainerModal from './modals/ContainerModal';
import KeyboardComponent from './components/KeyboardComponent';

const MAX_ATTEMPTS = 7;

function App() {

  const [answer, setAnswer]: any = useState({});
  const [selectedWord, setSelectedWord] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(0);
  const [lockedRows, setLockedRows] = useState<boolean[]>(
    Array.from({ length: MAX_ATTEMPTS }, () => false)
  );
  const [gameOver, setGameOver] = useState(false);
  const [gameEnd, setGameEnd] = useState(false)
  const [result, setResult] = useState(false);
  const [cursorCol, setCursorCol] = useState<number | null>(null);


  const cols = (selectedWord ?? "").length;
  const inputsRef = useRef<Array<Array<HTMLInputElement | null>>>([]);

  function cleanName(name: string): string {
    return name
      .toUpperCase()
      .split(",")[0]
      .trim()
      .replace(/ash-of-war:-/gi, "")
      .replace(/aspects-of-the-crucible:-/gi, "")
      .replace(/-"apologies"/gi, "")
      .trim();
  }

  const pickRandom = () => {
    setKeyStates({});
    const len = data.data.length;
    const idx = Math.floor(Math.random() * len);
    let selected = cleanName(data.data[idx].name);
    setAnswer(data.data[idx]);
    setSelectedWord(selected);
  };

  useEffect(() => { pickRandom(); }, []);

  useEffect(() => {
    inputsRef.current = Array.from({ length: MAX_ATTEMPTS }, () =>
      Array.from({ length: cols }, () => null)
    );
  }, [cols]);

  const isSpace = (c: number) => selectedWord[c] === " ";
  const isLine = (c: number) => selectedWord[c] === "'";

  const nextCol = (c: number) => {
    for (let j = c + 1; j < cols; j++) if (!isSpace(j) && !isLine(j)) return j;
    return null;
  };
  const prevCol = (c: number) => {
    for (let j = c - 1; j >= 0; j--) if (!isSpace(j) && !isLine(j)) return j;
    return null;
  };

  const firstEditableCol = () => {
    for (let j = 0; j < cols; j++) if (!isSpace(j) && !isLine(j)) return j;
    return null;
  };
  const lastFilledEditableCol = (row: number) => {
    for (let j = cols - 1; j >= 0; j--) {
      if (isSpace(j) || isLine(j)) continue;
      const el = inputsRef.current[row][j];
      if (el && el.value) return j;
    }
    return null;
  };

  const normalize = (s: string) =>
    s
      .toUpperCase()
      .normalize("NFD")
      .replace(/[^A-Z]/g, "");

  type KeyStatus = "correct" | "present" | "absent";
  const [keyStates, setKeyStates] = useState<Record<string, KeyStatus>>({});

  function upgradeKey(letter: string, status: KeyStatus) {
    const l = letter.toLowerCase();
    setKeyStates(prev => {
      const rank = (s: KeyStatus) => (s === "correct" ? 3 : s === "present" ? 2 : 1);
      const cur = prev[l];
      if (!cur || rank(status) > rank(cur)) {
        return { ...prev, [l]: status };
      }
      return prev;
    });
  }



  function submitRow(row: number) {
    if (!selectedWord || gameOver || lockedRows[row] || row !== currentRow) return;
    let firstEmpty: number | null = null;
    for (let c = 0; c < cols; c++) {
      if (isSpace(c) || isLine(c)) continue;
      const el = inputsRef.current[row][c];
      const val = (el?.value ?? "").toUpperCase().replace(/[^A-Z]/g, "");
      if (!val) {
        firstEmpty = c;
        break;
      }
    }
    if (firstEmpty !== null) {
      inputsRef.current[row][firstEmpty]?.focus();
      return;
    }

    const answer = normalize(selectedWord);
    const guessChars: string[] = [];
    for (let c = 0; c < cols; c++) {
      if (isSpace(c) || isLine(c)) continue;
      const v = (inputsRef.current[row][c]?.value ?? "").toUpperCase().replace(/[^A-Z]/g, "");
      guessChars.push(v);
    }
    const guess = normalize(guessChars.join(""));
    if (guess.length !== answer.length) return;

    const judgedCompact = judge(guess, answer);

    for (let i = 0; i < guess.length; i++) {
      upgradeKey(guess[i], judgedCompact[i]);
    }

    const STEP = 220;
    const FLIP_MS = 600;

    let k = 0;
    for (let c = 0; c < cols; c++) {
      const el = inputsRef.current[row][c];
      if (!el) continue;

      el.classList.remove("correct", "present", "absent", "flip");

      if (isSpace(c) || isLine(c)) continue;

      const state = judgedCompact[k++];
      const delay = STEP * (k - 1);

      setTimeout(() => {
        el.classList.add("flip");

        setTimeout(() => {
          el.classList.add(state);
        }, FLIP_MS * 0.52);
      }, delay);
    }

    const totalRevealTime = (k) * STEP + FLIP_MS;

    setTimeout(() => {
      setLockedRows(prev => { const copy = [...prev]; copy[row] = true; return copy; });

      if (judgedCompact.every(s => s === "correct")) {
        setResult(true);
        setGameOver(true);
        setGameEnd(true);
        return;
      }

      if (row + 1 < MAX_ATTEMPTS) {
        setCurrentRow(row + 1);
        const first = firstEditableCol();
        if (first !== null) inputsRef.current[row + 1][first]?.focus();
      } else {
        setGameOver(true);
        setGameEnd(true);
      }
    }, totalRevealTime);
  }



  const handlePlayAgain = () => {
    window.location.reload();
  };

  const handleCloseModal = () => {
    setGameEnd(false);
    setHelpOpen(false);
    setOptionsOpen(false);
  };

  function judge(guess: string, answer: string): ("correct" | "present" | "absent")[] {
    const n = answer.length;
    const res = Array<"correct" | "present" | "absent">(n).fill("absent");
    const a = answer.split("");
    const g = guess.split("");
    const cnt: Record<string, number> = {};

    a.forEach(ch => (cnt[ch] = (cnt[ch] || 0) + 1));

    for (let i = 0; i < n; i++) {
      if (g[i] === a[i]) {
        res[i] = "correct";
        cnt[g[i]]!--;
      }
    }
    for (let i = 0; i < n; i++) {
      if (res[i] === "correct") continue;
      const ch = g[i];
      if (cnt[ch] > 0) {
        res[i] = "present";
        cnt[ch]!--;
      } else {
        res[i] = "absent";
      }
    }
    return res;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, r: number, c: number) => {
    if (gameOver || r !== currentRow || lockedRows[r]) return;
    e.target.value = e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase();
    if (e.target.value) {
      const n = nextCol(c);
      if (n !== null) {
        inputsRef.current[r][n]?.focus();
        setCursorCol(n);
      }
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
    if (gameOver || r !== currentRow || lockedRows[r]) return;

    if (e.key === "Backspace" && !e.currentTarget.value) {
      const p = prevCol(c);
      if (p !== null) {
        inputsRef.current[r][p]?.focus();
        setCursorCol(p);
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      submitRow(r);
    }
  };


  function nextEmptyAfter(col: number, row: number) {
    for (let j = col; j < cols; j++) {
      if (!isSpace(j) && !isLine(j)) {
        const el = inputsRef.current[row][j];
        if (el && !el.value) return j;
      }
    }
    return null;
  }

  function insertChar(ch: string) {
    if (gameOver || lockedRows[currentRow]) return;

    let c = cursorCol;
    if (c == null || isSpace(c) || isLine(c)) c = firstEditableCol();
    if (c == null) return;

    const target = nextEmptyAfter(c, currentRow) ?? c;

    const el = inputsRef.current[currentRow][target];
    if (!el) return;

    el.value = ch.toUpperCase();

    const n = nextCol(target);
    if (n !== null) {
      inputsRef.current[currentRow][n]?.focus();
      setCursorCol(n);
    }
  }



  function backspaceChar() {
    if (gameOver || lockedRows[currentRow]) return;

    let c = cursorCol;

    if (c == null || isSpace(c) || isLine(c)) {
      c = lastFilledEditableCol(currentRow);
      if (c == null) return;
    }

    const el = inputsRef.current[currentRow][c];
    if (!el) return;

    if (el.value) {
      el.value = "";
      el.focus();
      setCursorCol(c);
    } else {
      const p = prevCol(c);
      if (p !== null) {
        const pel = inputsRef.current[currentRow][p];
        pel?.focus();
        setCursorCol(p);
        if (pel && pel.value) pel.value = "";
      }
    }
  }


  function onEnterFromKeyboard() {
    submitRow(currentRow);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (helpOpen || optionsOpen || gameOver) return;
      if (/^[a-z]$/i.test(e.key)) { e.preventDefault(); insertChar(e.key); return; }
      if (e.key === "Backspace") { e.preventDefault(); backspaceChar(); return; }
      if (e.key === "Enter") { e.preventDefault(); submitRow(currentRow); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentRow, gameOver, helpOpen, optionsOpen, lockedRows, cols]);


  useEffect(() => {
    if (gameOver || cols === 0) return;
    const first = firstEditableCol();
    if (first !== null) {
      inputsRef.current[currentRow]?.[first]?.focus();
      setCursorCol(first);
    }
  }, [currentRow, cols, gameOver]);



  return (
    <>
      <section className='worden-ring-main'>
        <section className='top'>
          <button className="top-help" onClick={() => setHelpOpen(true)}>?</button>
          <p className="top-title">Worden Ring</p>
          <button className="top-about" onClick={() => setOptionsOpen(true)}>!</button>
        </section>

        <section className='content'>
          {Array.from({ length: MAX_ATTEMPTS }).map((_, row) => (
            <div className='content-chance' key={row}>
              {Array.from(selectedWord ?? "").map((_, col) => (
                <input
                  key={col}
                  maxLength={1}
                  className="words-square"
                  disabled={isSpace(col) || isLine(col) || row !== currentRow || lockedRows[row] || gameOver}
                  placeholder={isSpace(col) ? "␣" : isLine(col) ? "'" : ""}
                  ref={(el) => {
                    if (!inputsRef.current[row]) inputsRef.current[row] = Array(cols).fill(null);
                    inputsRef.current[row][col] = el;
                  }}
                  onFocus={() => setCursorCol(col)}
                  onChange={(e) => handleChange(e, row, col)}
                  onKeyDown={(e) => handleKeyDown(e, row, col)}
                />
              ))}
            </div>
          ))}

          <div style={{ marginTop: 50 }}>
            <KeyboardComponent
              onChar={(ch) => insertChar(ch)}
              onBackspace={() => backspaceChar()}
              onEnter={() => onEnterFromKeyboard()}
              disabled={gameOver || lockedRows[currentRow]}
              keyStates={keyStates}
            />
          </div>
        </section>

        {helpOpen && (
          <ContainerModal handleCloseModal={handleCloseModal} isHelp={helpOpen} />
        )}

        {optionsOpen && (
          <ContainerModal handleCloseModal={handleCloseModal} isOptions={optionsOpen} />
        )}

        {gameEnd && (
          <ContainerModal
            handleCloseModal={handleCloseModal}
            result={result}
            selectedWord={selectedWord}
            answer={answer}
            handlePlayAgain={handlePlayAgain}
            isGameOver={gameEnd}
          />
        )}
      </section>
    </>
  );
}

export default App
