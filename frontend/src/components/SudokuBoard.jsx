import React from "react";
import { getBoxIndex } from "../sudoku";

export default function SudokuBoard({
  puzzle,
  board,
  selectedCell,
  setSelectedCell,
  mistakes,
  showValidation
}) {
  const selectedRow = selectedCell?.row ?? -1;
  const selectedCol = selectedCell?.col ?? -1;
  const selectedBox = selectedCell ? getBoxIndex(selectedRow, selectedCol) : -1;

  return (
    <div className="board" role="grid" aria-label="Sudoku board">
      {board.map((row, rowIdx) =>
        row.map((value, colIdx) => {
          const isFixed = puzzle[rowIdx][colIdx] !== 0;
          const isSelected = selectedRow === rowIdx && selectedCol === colIdx;
          const inFocusGroup =
            selectedCell &&
            (selectedRow === rowIdx ||
              selectedCol === colIdx ||
              selectedBox === getBoxIndex(rowIdx, colIdx));

          const isMistake = showValidation && mistakes.has(`${rowIdx}-${colIdx}`);

          const classNames = [
            "cell",
            isFixed ? "fixed" : "editable",
            isSelected ? "selected" : "",
            inFocusGroup ? "related" : "",
            isMistake ? "mistake" : ""
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={`${rowIdx}-${colIdx}`}
              className={classNames}
              onClick={() => setSelectedCell({ row: rowIdx, col: colIdx })}
              aria-label={`row ${rowIdx + 1} column ${colIdx + 1}`}
            >
              {value === 0 ? "" : value}
            </button>
          );
        })
      )}
    </div>
  );
}
