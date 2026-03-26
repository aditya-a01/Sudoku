export const GRID_SIZE = 9;

export function cloneBoard(board) {
  return board.map((row) => [...row]);
}

export function getBoxIndex(row, col) {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

export function isBoardSolved(board, solution) {
  for (let r = 0; r < GRID_SIZE; r += 1) {
    for (let c = 0; c < GRID_SIZE; c += 1) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

export function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

export function boardToMistakes(board, solution) {
  const mistakes = new Set();
  for (let r = 0; r < GRID_SIZE; r += 1) {
    for (let c = 0; c < GRID_SIZE; c += 1) {
      if (board[r][c] !== 0 && board[r][c] !== solution[r][c]) {
        mistakes.add(`${r}-${c}`);
      }
    }
  }
  return mistakes;
}

export async function requestPuzzle(difficulty = "medium") {
  const res = await fetch(`http://localhost:4000/api/puzzle?difficulty=${difficulty}`);
  if (!res.ok) {
    throw new Error("Unable to fetch puzzle from backend.");
  }
  return res.json();
}
