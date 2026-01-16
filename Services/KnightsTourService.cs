namespace AlgoPuzzleBoard.MVC.Services
{
    // The algorith tellss that 
   // Warnsdorff’s heuristic:
    //Reduces backtracking
    //Gives fast and reliable results
    //Always move the knight to the square that has the fewest future possible moves
    public class KnightsTourService
    {
        private static readonly int[] dx = { 1, 1, 2, 2, -1, -1, -2, -2 };
        private static readonly int[] dy = { 2, -2, 1, -1, 2, -2, 1, -1 };
        private const int N = 8;

        public List<int[]> SolveKnightTour(int startRow, int startCol)
        {
            var board = new int[N, N];
            for (int i = 0; i < N; i++)
                for (int j = 0; j < N; j++)
                    board[i, j] = -1;

            var path = new List<int[]>();
            int x = startRow, y = startCol;
            board[x, y] = 0; // Step 0
            path.Add(new int[] { x, y });

            for (int i = 1; i < N * N; i++)
            {
                int nextX = -1, nextY = -1;
                int minDegree = (N + 1);

                for (int k = 0; k < 8; k++)
                {
                    int nx = x + dx[k];
                    int ny = y + dy[k];

                    if (IsValid(nx, ny, board))
                    {
                        int c = GetDegree(nx, ny, board);
                        if (c < minDegree)
                        {
                            minDegree = c;
                            nextX = nx;
                            nextY = ny;
                        }
                    }
                }

                if (nextX == -1) break; // Failed

                // Tie-breaking or just take the best
                x = nextX;
                y = nextY;
                board[x, y] = i;
                path.Add(new int[] { x, y });
            }

            return path;
        }

        private int GetDegree(int x, int y, int[,] board)
        {
            int count = 0;
            for (int k = 0; k < 8; k++)
            {
                if (IsValid(x + dx[k], y + dy[k], board))
                    count++;
            }
            return count;
        }

        private bool IsValid(int x, int y, int[,] board)
        {
            return (x >= 0 && x < N && y >= 0 && y < N && board[x, y] == -1);
        }

        public int[]? GetNextMove(int[,] board, int currentRow, int currentCol)
        {
            int nextX = -1, nextY = -1;
            int minDegree = (N + 1);

            for (int k = 0; k < 8; k++)
            {
                int nx = currentRow + dx[k];
                int ny = currentCol + dy[k];

                if (IsValid(nx, ny, board))
                {
                    int c = GetDegree(nx, ny, board);
                    if (c < minDegree)
                    {
                        minDegree = c;
                        nextX = nx;
                        nextY = ny;
                    }
                }
            }
// agr valid move found hoi ha return karde ga row column else columns null return karde ga
            if (nextX != -1)
                return new int[] { nextX, nextY };
            
            return null;
        }
    }
}
