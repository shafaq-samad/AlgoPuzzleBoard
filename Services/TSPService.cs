using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class TSPService
    {
        public TSPResult SolveTSP(List<City> cities)
        {
            int n = cities.Count;
            double[][] distances = new double[n][];
            for (int i = 0; i < n; i++)
            {
                distances[i] = new double[n];
                for (int j = 0; j < n; j++)
                {
                    double dx = cities[i].X - cities[j].X;
                    double dy = cities[i].Y - cities[j].Y;
                    distances[i][j] = Math.Sqrt(dx * dx + dy * dy);
                }
            }

            var tour = SolveGreedy(distances);

            double totalDist = 0;
            if (tour.Count > 0)
            {
                for (int i = 0; i < tour.Count - 1; i++)
                {
                    totalDist += distances[tour[i]][tour[i + 1]];
                }
            }

            return new TSPResult { Tour = tour, TotalDistance = totalDist };
        }

        public List<int> SolveGreedy(double[][] distances)
        {
            int n = distances.Length;
            if (n == 0) return new List<int>();

            var path = new List<int>();
            var visited = new bool[n];

            // Start at city 0
            int current = 0;
            path.Add(current);
            visited[current] = true;

            for (int i = 0; i < n - 1; i++)
            {
                int next = -1;
                double minDist = double.MaxValue;

                for (int j = 0; j < n; j++)
                {
                    if (!visited[j] && distances[current][j] < minDist)
                    {
                        minDist = distances[current][j];
                        next = j;
                    }
                }

                if (next != -1)
                {
                    visited[next] = true;
                    path.Add(next);
                    current = next;
                }
            }

            // Return to start
            path.Add(path[0]);
            return path;
        }

        public object? GetNextBestMove(List<City> cities, List<int> currentPath)
        {
            // Suggest nearest unvisited city from the last city in path
            if (currentPath.Count == 0 || cities.Count == 0) return null;
            if (currentPath.Count == cities.Count) {
                // Return to start suggestion
                return new { nextCityIndex = currentPath[0] };
            }

            int currentCityIdx = currentPath.Last();
            var currentCity = cities[currentCityIdx];
            
            // Find nearest unvisited
            int nextCityIdx = -1;
            double minDist = double.MaxValue;

            for (int i = 0; i < cities.Count; i++)
            {
                if (currentPath.Contains(i)) continue;

                double dx = currentCity.X - cities[i].X;
                double dy = currentCity.Y - cities[i].Y;
                double dist = Math.Sqrt(dx*dx + dy*dy);

                if (dist < minDist)
                {
                    minDist = dist;
                    nextCityIdx = i;
                }
            }

            if (nextCityIdx != -1)
            {
                return new { nextCityIndex = nextCityIdx };
            }
            
            return null;
        }
    }
}
