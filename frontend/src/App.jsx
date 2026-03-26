import React, { useEffect, useMemo, useState } from "react";
import SudokuBoard from "./components/SudokuBoard";
import ThemeSelector from "./components/ThemeSelector";
import GameControls from "./components/GameControls";
import {
  boardToMistakes,
  cloneBoard,
  formatTime,
  isBoardSolved,
  requestPuzzle
} from "./sudoku";

const THEME_STORAGE = "sudoku_theme";
const CUSTOM_THEME_STORAGE = "sudoku_custom_theme";
const GAME_STORAGE = "sudoku_game_state";
const SETTINGS_STORAGE = "sudoku_settings";

const initialCustomTheme = {
  bg: "#13151d",
  surface: "#1f2430",
  accent: "#51b5ff",
  text: "#f7f9ff"
};

function getSavedValue(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [theme, setTheme] = useState(() => getSavedValue(THEME_STORAGE, "light"));
  const [customColors, setCustomColors] = useState(() =>
    getSavedValue(CUSTOM_THEME_STORAGE, initialCustomTheme)
  );
  const [difficulty, setDifficulty] = useState(() =>
    getSavedValue(SETTINGS_STORAGE, { difficulty: "medium", validateRealtime: true }).difficulty
  );
  const [validateRealtime, setValidateRealtime] = useState(() =>
    getSavedValue(SETTINGS_STORAGE, { difficulty: "medium", validateRealtime: true })
      .validateRealtime
  );

  const [puzzle, setPuzzle] = useState(Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [solution, setSolution] = useState(Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [board, setBoard] = useState(Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [selectedCell, setSelectedCell] = useState(null);
  const [mistakes, setMistakes] = useState(new Set());
  const [hintsLeft, setHintsLeft] = useState(3);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("Welcome to modern Sudoku.");
  const [won, setWon] = useState(false);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

  const themeStyle = useMemo(() => {
    if (theme !== "custom") return {};
    return {
      "--bg": customColors.bg,
      "--surface": customColors.surface,
      "--accent": customColors.accent,
      "--text": customColors.text
    };
  }, [theme, customColors]);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE, JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_THEME_STORAGE, JSON.stringify(customColors));
  }, [customColors]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE, JSON.stringify({ difficulty, validateRealtime }));
  }, [difficulty, validateRealtime]);

  useEffect(() => {
    const saved = getSavedValue(GAME_STORAGE, null);
    if (!saved) {
      startNewGame(difficulty);
      return;
    }

    setPuzzle(saved.puzzle);
    setSolution(saved.solution);
    setBoard(saved.board);
    setHintsLeft(saved.hintsLeft ?? 3);
    setDifficulty(saved.difficulty ?? difficulty);
    setTimeSeconds(saved.timeSeconds ?? 0);
    setWon(saved.won ?? false);
    setStatus(saved.won ? "Puzzle solved! Great job." : "Resumed your unfinished game.");
    setMistakes(boardToMistakes(saved.board, saved.solution));
  }, []);

  useEffect(() => {
    if (won || isLoading) return undefined;
    const timer = setInterval(() => setTimeSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [won, isLoading]);

  useEffect(() => {
    if (solution[0][0] === 0) return;
    localStorage.setItem(
      GAME_STORAGE,
      JSON.stringify({
        puzzle,
        solution,
        board,
        hintsLeft,
        difficulty,
        timeSeconds,
        won
      })
    );
  }, [puzzle, solution, board, hintsLeft, difficulty, timeSeconds, won]);

  useEffect(() => {
    function onKeyDown(e) {
      if (!selectedCell || won) return;
      const { key } = e;
      if (/^[1-9]$/.test(key)) {
        handleInput(Number(key));
      } else if (key === "Backspace" || key === "Delete" || key === "0") {
        handleInput(0);
      } else if (key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey)) {
        if (e.shiftKey) {
          doRedo();
        } else {
          doUndo();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  async function startNewGame(selectedDifficulty = difficulty) {
    try {
      setIsLoading(true);
      setWon(false);
      setStatus("Generating puzzle...");
      setSelectedCell(null);
      const data = await requestPuzzle(selectedDifficulty);
      setPuzzle(data.puzzle);
      setSolution(data.solution);
      setBoard(cloneBoard(data.puzzle));
      setHintsLeft(3);
      setTimeSeconds(0);
      setMistakes(new Set());
      setHistory([]);
      setFuture([]);
      setStatus(`New ${selectedDifficulty} puzzle ready.`);
    } catch (error) {
      setStatus(error.message || "Failed to generate puzzle. Is backend running?");
    } finally {
      setIsLoading(false);
    }
  }

  function addHistorySnapshot(nextBoard, nextMistakes) {
    setHistory((prev) => [...prev, { board: cloneBoard(board), mistakes: [...mistakes] }]);
    setFuture([]);
    setBoard(nextBoard);
    setMistakes(nextMistakes);
  }

  function handleInput(value) {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (puzzle[row][col] !== 0) return;

    const nextBoard = cloneBoard(board);
    nextBoard[row][col] = value;
    const nextMistakes = boardToMistakes(nextBoard, solution);

    addHistorySnapshot(nextBoard, nextMistakes);

    if (value === 0) {
      setStatus("Cell cleared.");
    } else {
      setStatus(`Placed ${value}.`);
    }

    if (isBoardSolved(nextBoard, solution)) {
      setWon(true);
      setStatus("Solved! Excellent work.");
    }
  }

  function doUndo() {
    setHistory((prev) => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      setFuture((fPrev) => [...fPrev, { board: cloneBoard(board), mistakes: [...mistakes] }]);
      setBoard(last.board);
      setMistakes(new Set(last.mistakes));
      setWon(false);
      setStatus("Undo completed.");
      return prev.slice(0, -1);
    });
  }

  function doRedo() {
    setFuture((prev) => {
      if (!prev.length) return prev;
      const next = prev[prev.length - 1];
      setHistory((hPrev) => [...hPrev, { board: cloneBoard(board), mistakes: [...mistakes] }]);
      setBoard(next.board);
      setMistakes(new Set(next.mistakes));
      if (isBoardSolved(next.board, solution)) setWon(true);
      setStatus("Redo completed.");
      return prev.slice(0, -1);
    });
  }

  function resetBoard() {
    setBoard(cloneBoard(puzzle));
    setMistakes(new Set());
    setHistory([]);
    setFuture([]);
    setWon(false);
    setStatus("Board reset.");
  }

  function useHint() {
    if (hintsLeft <= 0 || won) return;

    const target = selectedCell && board[selectedCell.row][selectedCell.col] === 0
      ? selectedCell
      : findFirstEmptyCell();
    if (!target) return;

    const nextBoard = cloneBoard(board);
    nextBoard[target.row][target.col] = solution[target.row][target.col];
    const nextMistakes = boardToMistakes(nextBoard, solution);
    addHistorySnapshot(nextBoard, nextMistakes);
    setHintsLeft((prev) => prev - 1);
    setSelectedCell(target);
    setStatus("Hint used.");

    if (isBoardSolved(nextBoard, solution)) {
      setWon(true);
      setStatus("Solved! Excellent work.");
    }
  }

  function findFirstEmptyCell() {
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (board[r][c] === 0) return { row: r, col: c };
      }
    }
    return null;
  }

  return (
    <div className={`app ${won ? "victory" : ""}`} style={themeStyle}>
      <header>
        <h1>Modern Sudoku</h1>
        <div className="meta">
          <span>Time: {formatTime(timeSeconds)}</span>
          <span>Difficulty: {difficulty}</span>
          <span>{isLoading ? "Loading..." : status}</span>
        </div>
      </header>

      <main>
        <section className="game-area">
          <SudokuBoard
            puzzle={puzzle}
            board={board}
            selectedCell={selectedCell}
            setSelectedCell={setSelectedCell}
            mistakes={mistakes}
            showValidation={validateRealtime}
          />
          <div className="number-pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button key={num} onClick={() => handleInput(num)}>
                {num}
              </button>
            ))}
            <button className="clear-btn" onClick={() => handleInput(0)}>
              Clear
            </button>
          </div>
        </section>

        <aside>
          <GameControls
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onNewGame={() => startNewGame(difficulty)}
            onReset={resetBoard}
            onHint={useHint}
            onUndo={doUndo}
            onRedo={doRedo}
            hintsLeft={hintsLeft}
            canUndo={canUndo}
            canRedo={canRedo}
            validateRealtime={validateRealtime}
            setValidateRealtime={setValidateRealtime}
          />
          <ThemeSelector
            theme={theme}
            setTheme={setTheme}
            customColors={customColors}
            setCustomColors={setCustomColors}
          />
        </aside>
      </main>
    </div>
  );
}
