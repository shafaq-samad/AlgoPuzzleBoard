namespace AlgoPuzzleBoard.MVC.Services
{
    public class NQueensService
    {
        private List<object> steps = new List<object>();
        private int backtrackCount = 0;

        public List<object> SolveWithSteps(int n)
        {
            steps = new List<object>();
            backtrackCount = 0;
            var board = new int[n];
            for (int i = 0; i < n; i++) board[i] = -1;

            SolveNQueensWithSteps(0, n, board);
            return steps;
        }

        private bool SolveNQueensWithSteps(int row, int n, int[] board)
        {
            if (row == n)
            {
                // Found a solution
                steps.Add(new { board = board.ToArray(), backtracks = backtrackCount, isSolution = true });
                return true;
            }

            for (int col = 0; col < n; col++)
            {
                if (IsSafe(row, col, board))
                {
                    board[row] = col;
                    // Add step after placing queen
                    steps.Add(new { board = board.ToArray(), backtracks = backtrackCount, isSolution = false });

                    if (SolveNQueensWithSteps(row + 1, n, board))
                    {
                        return true;
                    }

                    // Backtrack - remove queen
                    board[row] = -1;
                    backtrackCount++;
                    steps.Add(new { board = board.ToArray(), backtracks = backtrackCount, isSolution = false });
                }
            }

            return false;
        }

        private bool IsSafe(int row, int col, int[] board)
        {
            for (int i = 0; i < row; i++)
            {
                int placedCol = board[i];
                // Check column conflict
                if (placedCol == col) return false;
                // Check diagonal conflict
                if (Math.Abs(placedCol - col) == Math.Abs(i - row)) return false;
            }
            return true;
        }

        public object? GetNextSafeMove(int[] currentBoard)
        {
            int n = currentBoard.Length;
            int rowToPlace = -1;

            // Find the first empty row
            for(int i = 0; i < n; i++)
            {
                if(currentBoard[i] == -1)
                {
                    rowToPlace = i;
                    break;
                }
            }

            if (rowToPlace == -1) return null; // Board is full

            // Try to find a safe column in this row
            for (int col = 0; col < n; col++)
            {
                if (IsSafe(rowToPlace, col, currentBoard))
                {
                    return new { row = rowToPlace, col = col };
                }
            }

            return null; // No safe move found for this row (backtracking needed)
        }

        // Keep old method for compatibility
        public List<List<int>> Solve(int n)
        {
            var solutions = new List<List<int>>();
            var board = new int[n];
            for (int i = 0; i < n; i++) board[i] = -1;
            SolveNQueens(0, n, board, solutions);
            return solutions;
        }

        private void SolveNQueens(int row, int n, int[] board, List<List<int>> solutions)
        {
            if (row == n)
            {
                solutions.Add(new List<int>(board));
                return;
            }

            for (int col = 0; col < n; col++)
            {
                if (IsSafe(row, col, board))
                {
                    board[row] = col;
                    SolveNQueens(row + 1, n, board, solutions);
                    board[row] = -1;
                }
            }
        }
    }
}
