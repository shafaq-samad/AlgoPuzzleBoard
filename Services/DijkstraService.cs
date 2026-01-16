using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class DijkstraService
    {
        public DijkstraResult SolveDijkstra(List<DijkstraNode> nodes, List<DijkstraEdge> edges, string startId, string targetId)
        {
            var result = new DijkstraResult();
            var distances = new Dictionary<string, int>();
            var previous = new Dictionary<string, string>();
            var unvisited = new HashSet<string>();
            var visitedOrder = new List<string>();

            // Initialize
            foreach (var node in nodes)
            {
                distances[node.Id] = int.MaxValue;
                unvisited.Add(node.Id);
            }

            if (!distances.ContainsKey(startId) || !distances.ContainsKey(targetId))
            {
                result.Success = false;
                result.Message = "Invalid start or target node.";
                return result;
            }

            distances[startId] = 0;

            while (unvisited.Count > 0)
            {
                // Find node with smallest distance
                string? current = null;
                int minDist = int.MaxValue;

                foreach (var id in unvisited)
                {
                    if (distances[id] < minDist)
                    {
                        minDist = distances[id];
                        current = id;
                    }
                }

                if (current == null || distances[current] == int.MaxValue)
                {
                    break; // No reachable nodes left
                }

                unvisited.Remove(current);
                visitedOrder.Add(current);

                if (current == targetId)
                {
                    break; // Reached target
                }

                // Check neighbors
                var neighbors = edges.Where(e => e.Source == current || e.Target == current);
                foreach (var edge in neighbors)
                {
                    var neighborId = edge.Source == current ? edge.Target : edge.Source;
                    if (!unvisited.Contains(neighborId)) continue;

                    int newDist = distances[current] + edge.Weight;
                    if (newDist < distances[neighborId])
                    {
                        distances[neighborId] = newDist;
                        previous[neighborId] = current;
                    }
                }
            }

            // Reconstruct path
            if (distances[targetId] == int.MaxValue)
            {
                result.Success = false;
                result.Message = "No path found.";
                return result;
            }

            var path = new List<string>();
            string? step = targetId;
            while (step != null)
            {
                path.Insert(0, step);
                previous.TryGetValue(step, out step);
            }

            result.Path = path;
            result.TotalDistance = distances[targetId];
            result.VisitedOrder = visitedOrder;
            result.Success = true;

            return result;
        }

        public object? GetNextMove(List<DijkstraNode> nodes, List<DijkstraEdge> edges, string startId, string targetId)
        {
            // Solve from start to target to find the full path
            var result = SolveDijkstra(nodes, edges, startId, targetId);
            if (result.Success && result.Path.Count > 1)
            {
                return new { nextNodeId = result.Path[1] }; // Return the immediate next node
            }
            return null;
        }

        public DijkstraGraph GenerateRandomGraph(int nodeCount)
        {
            var graph = new DijkstraGraph();
            var rand = new Random();
            int width = 800; // Canvas width approx
            int height = 500; // Canvas height approx

            // Generate Nodes
            for (int i = 0; i < nodeCount; i++)
            {
                graph.Nodes.Add(new DijkstraNode
                {
                    Id = (i + 1).ToString(),
                    X = rand.Next(50, width - 50),
                    Y = rand.Next(50, height - 50)
                });
            }

            // Generate Edges (Randomly connect to ensure some connectivity)
            // Strategy: Connect each node to 2-3 random other nodes
            for (int i = 0; i < nodeCount; i++)
            {
                int edgesCount = rand.Next(1, 3);
                for (int j = 0; j < edgesCount; j++)
                {
                    int targetIdx = rand.Next(0, nodeCount);
                    if (targetIdx == i) continue;

                    string sourceId = graph.Nodes[i].Id;
                    string targetId = graph.Nodes[targetIdx].Id;

                    // Check if edge exists
                    bool exists = graph.Edges.Any(e => (e.Source == sourceId && e.Target == targetId) || (e.Source == targetId && e.Target == sourceId));
                    if (!exists)
                    {
                        // Calculate Euclidean distance for weight
                        var n1 = graph.Nodes[i];
                        var n2 = graph.Nodes[targetIdx];
                        int dist = (int)Math.Sqrt(Math.Pow(n1.X - n2.X, 2) + Math.Pow(n1.Y - n2.Y, 2));

                        graph.Edges.Add(new DijkstraEdge
                        {
                            Source = sourceId,
                            Target = targetId,
                            Weight = dist / 10 // Scale down weight for readability
                        });
                    }
                }
            }

            return graph;
        }
    }
}
