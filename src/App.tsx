import { useEffect, useState, useRef } from 'react'
import './App.css'
import { data } from './data/words';
import ContainerModal from './modals/ContainerModal';

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

  const nextCol = (c: number) => {
    for (let j = c + 1; j < cols; j++) if (!isSpace(j)) if (!isLine(j)) return j;
    return null;
  };
  const prevCol = (c: number) => {
    for (let j = c - 1; j >= 0; j--) if (!isSpace(j)) if (!isLine(j)) return j;
    return null;
  };

  const normalize = (s: string) =>
    s
      .toUpperCase()
      .normalize("NFD")
      .replace(/[^A-Z]/g, "");


  function submitRow(row: number) {
    if (!selectedWord || gameOver || lockedRows[row] || row !== currentRow) return;

    const answer = normalize(selectedWord);

    const guessChars: string[] = [];
    for (let c = 0; c < cols; c++) {
      if (isSpace(c)) continue;
      if (isLine(c)) continue;
      const v = (inputsRef.current[row][c]?.value ?? "").toUpperCase().replace(/[^A-Z]/g, "");
      if (!v) return;
      guessChars.push(v);
    }

    const guess = normalize(guessChars.join(""));

    if (guess.length !== answer.length) return;

    const judgedCompact = judge(guess, answer);
    let k = 0;
    for (let c = 0; c < cols; c++) {
      const el = inputsRef.current[row][c];
      if (!el) continue;
      el.classList.remove("correct", "present", "absent");
      if (isSpace(c) || isLine(c)) continue;
      el.classList.add(judgedCompact[k++]);
    }

    setLockedRows(prev => { const copy = [...prev]; copy[row] = true; return copy; });

    if (judgedCompact.every(s => s === "correct")) {
      setResult(true)
      setGameOver(true);
      setGameEnd(true);
      return;
    }

    if (row + 1 < MAX_ATTEMPTS) {
      setCurrentRow(row + 1);
      const first = nextCol(-1);
      if (first !== null) inputsRef.current[row + 1][first]?.focus();
    } else {
      setGameOver(true);
      setGameEnd(true);
    }
  }

  const handlePlayAgain = () => {
    window.location.reload();
  }

  const handleCloseModal = () => {
    setGameEnd(false);
    setHelpOpen(false);
    setOptionsOpen(false);
  }



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

  const isSpace = (c: number) => selectedWord[c] === " ";
  const isLine = (c: number) => selectedWord[c] === "'";


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, r: number, c: number) => {
    if (gameOver || r !== currentRow || lockedRows[r]) return;
    e.target.value = e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase(); // só letras
    if (e.target.value) {
      const n = nextCol(c);
      if (n !== null) inputsRef.current[r][n]?.focus();
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
    if (gameOver || r !== currentRow || lockedRows[r]) return;

    if (e.key === "Backspace" && !e.currentTarget.value) {
      const p = prevCol(c);
      if (p !== null) inputsRef.current[r][p]?.focus();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      submitRow(r);
    }
  };


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
                  onChange={(e) => handleChange(e, row, col)}
                  onKeyDown={(e) => handleKeyDown(e, row, col)}
                />
              ))}
            </div>
          ))}
        </section>

        {
          helpOpen && (
            <ContainerModal handleCloseModal={handleCloseModal} isHelp={helpOpen} />
          )
        }

        {
          optionsOpen && (

            <ContainerModal handleCloseModal={handleCloseModal} isOptions={optionsOpen} />
          )
        }

        {
          gameEnd && (
            <ContainerModal handleCloseModal={handleCloseModal} result={result} selectedWord={selectedWord} answer={answer} handlePlayAgain={handlePlayAgain} isGameOver={gameEnd} />
          )
        }

        <p className='version'>V 0.0.1</p>
      </section>
    </>
  );

}

export default App
