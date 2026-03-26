import React from "react";

export default function GameControls({
  difficulty,
  setDifficulty,
  onNewGame,
  onReset,
  onHint,
  onUndo,
  onRedo,
  hintsLeft,
  canUndo,
  canRedo,
  validateRealtime,
  setValidateRealtime
}) {
  return (
    <section className="panel">
      <h3>Game Controls</h3>
      <div className="controls-grid">
        <label className="field">
          Difficulty
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={validateRealtime}
            onChange={(e) => setValidateRealtime(e.target.checked)}
          />
          Real-time validation
        </label>

        <button onClick={onNewGame}>New Game</button>
        <button onClick={onReset}>Reset</button>
        <button onClick={onHint} disabled={hintsLeft <= 0}>
          Hint ({hintsLeft})
        </button>
        <button onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button onClick={onRedo} disabled={!canRedo}>
          Redo
        </button>
      </div>
    </section>
  );
}
