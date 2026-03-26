import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const GRID_SIZE = 9;
const BOX_SIZE = 3;

function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

function isValidPlacement(grid, row, col, num) {
  for (let i = 0; i < GRID_SIZE; i += 1) {
    if (grid[row][i] === num || grid[i][col] === num) return false;
  }

  const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = startRow; r < startRow + BOX_SIZE; r += 1) {
    for (let c = startCol; c < startCol + BOX_SIZE; c += 1) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function shuffledNumbers() {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = nums.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums;
}

function fillGrid(grid) {
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (grid[row][col] === 0) {
        const nums = shuffledNumbers();
        for (const num of nums) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function countSolutions(grid, limit = 2) {
  let count = 0;

  function solve() {
    if (count >= limit) return;

    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num += 1) {
            if (isValidPlacement(grid, row, col, num)) {
              grid[row][col] = num;
              solve();
              grid[row][col] = 0;
            }
          }
          return;
        }
      }
    }
    count += 1;
  }

  solve();
  return count;
}

function removeCellsWithUniqueness(solution, cluesTarget) {
  const puzzle = cloneGrid(solution);
  const totalCells = GRID_SIZE * GRID_SIZE;
  const removalsTarget = totalCells - cluesTarget;

  const positions = [];
  for (let r = 0; r < GRID_SIZE; r += 1) {
    for (let c = 0; c < GRID_SIZE; c += 1) {
      positions.push([r, c]);
    }
  }

  for (let i = positions.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  let removed = 0;
  for (const [row, col] of positions) {
    if (removed >= removalsTarget) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    const candidate = cloneGrid(puzzle);
    const solutionCount = countSolutions(candidate, 2);
    if (solutionCount !== 1) {
      puzzle[row][col] = backup;
    } else {
      removed += 1;
    }
  }

  return puzzle;
}

function difficultyToClues(difficulty) {
  switch (difficulty) {
    case "easy":
      return 40;
    case "hard":
      return 28;
    case "medium":
    default:
      return 34;
  }
}

function generatePuzzle(difficulty = "medium") {
  const solution = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => 0)
  );
  fillGrid(solution);

  const clues = difficultyToClues(difficulty);
  const puzzle = removeCellsWithUniqueness(solution, clues);

  return { puzzle, solution, difficulty };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/puzzle", (req, res) => {
  const difficulty = `${req.query.difficulty || "medium"}`.toLowerCase();
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return res.status(400).json({ error: "Invalid difficulty" });
  }
  const data = generatePuzzle(difficulty);
  return res.json(data);
});

app.listen(PORT, () => {
  console.log(`Sudoku API running on http://localhost:${PORT}`);
});
