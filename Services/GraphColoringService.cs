using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class GraphColoringService
    {
       
        public Dictionary<int, int> SolveGreedy(int[][] adjacencyMatrix)
        {
            int n = adjacencyMatrix.Length;
            var result = new Dictionary<int, int>();
            var available = new bool[n]; // Tracks used colors

            // Assign first color to frst node
            result[0] = 0;

            // Initialize remaining as unassigned
            for (int i = 1; i < n; i++)
                result[i] = -1;

            // Assign colors to remaining nodes
            for (int u = 1; u < n; u++)
            {
                for (int i = 0; i < n; i++) available[i] = true; // reset

                for (int v = 0; v < n; v++)
                {
                    if (adjacencyMatrix[u][v] == 1 && result.ContainsKey(v) && result[v] != -1)
                    {
                        if (result[v] < n) 
                            available[result[v]] = false; 
                    }
                }

                // Find the first available color
                int cr;
                for (cr = 0; cr < n; cr++)
                {
                    if (available[cr]) 
                    {
                        break;
                    }
                }

                result[u] = cr;
            }

            return result;
        }
        public Graph GenerateRandomGraph(int nodeCount)
        {
            var graph = new Graph();
            var rand = new Random();
            if (nodeCount <= 0) nodeCount = rand.Next(5, 11);
            // Frontend expects 0-100 percentage coordinates

            for (int i = 0; i < nodeCount; i++)
            {
                graph.Nodes.Add(new Node
                {
                    Id = i,
                    X = 10 + rand.NextDouble() * 80,
                    Y = 10 + rand.NextDouble() * 80,
                    ColorIndex = -1
                });
            }

            // Create some random edges (approx 1.5 * n edges)
            int edgeCount = (int)(nodeCount * 1.5);
            for (int i = 0; i < edgeCount; i++)
            {
                int u = rand.Next(nodeCount);
                int v = rand.Next(nodeCount);
                if (u != v && !graph.Edges.Any(e => (e.Source == u && e.Target == v) || (e.Source == v && e.Target == u)))
                {
                    graph.Edges.Add(new Edge { Source = u, Target = v });
                }
            }

            return graph;
        }

        public Graph SolveGreedyColoring(Graph graph)
        {
            int n = graph.Nodes.Count;
            if (n == 0) return graph;

            // Build adjacency matrix from Graph
            int[][] adj = new int[n][];
            for (int i = 0; i < n; i++) adj[i] = new int[n];

            foreach (var edge in graph.Edges)
            {
                if (edge.Source < n && edge.Target < n)
                {
                    adj[edge.Source][edge.Target] = 1;
                    adj[edge.Target][edge.Source] = 1;
                }
            }

            var colors = SolveGreedy(adj);

            // Apply colors
            foreach (var kvp in colors)
            {
                var node = graph.Nodes.FirstOrDefault(x => x.Id == kvp.Key);
                if (node != null)
                {
                    node.ColorIndex = kvp.Value;
                }
            }

            return graph;
        }

        public List<string> CheckConflicts(Graph graph)
        {
            var conflicts = new List<string>();
            foreach (var edge in graph.Edges)
            {
                var u = graph.Nodes.FirstOrDefault(n => n.Id == edge.Source);
                var v = graph.Nodes.FirstOrDefault(n => n.Id == edge.Target);

                if (u != null && v != null && u.ColorIndex != -1 && u.ColorIndex == v.ColorIndex)
                {
                    conflicts.Add($"Conflict between Node {u.Id} and Node {v.Id} (Color {u.ColorIndex})");
                }
            }
            return conflicts;
        }

        public object? GetNextBestMove(Graph graph)
        {
            // Heuristic: Saturation Degree (DSatur)
            // 1. Pick uncolored node with highest number of different colored neighbors
            // 2. Tie-break: highest degree (uncolored neighbors)
            
            int n = graph.Nodes.Count;
            int bestNodeId = -1;
            int maxSaturation = -1;
            int maxDegree = -1;

            foreach (var node in graph.Nodes)
            {
                if (node.ColorIndex != -1) continue;

                // Calculate Saturation
                var neighbors = graph.Edges
                    .Where(e => e.Source == node.Id || e.Target == node.Id)
                    .Select(e => e.Source == node.Id ? e.Target : e.Source)
                    .ToList();
                
                var coloredNeighbors = neighbors
                    .Select(nid => graph.Nodes.FirstOrDefault(x => x.Id == nid))
                    .Where(x => x != null && x.ColorIndex != -1)
                    .Select(x => x!.ColorIndex)
                    .Distinct()
                    .Count();

                int degree = neighbors.Count;

                if (coloredNeighbors > maxSaturation)
                {
                    maxSaturation = coloredNeighbors;
                    maxDegree = degree;
                    bestNodeId = node.Id;
                }
                else if (coloredNeighbors == maxSaturation)
                {
                    if (degree > maxDegree)
                    {
                        maxDegree = degree;
                        bestNodeId = node.Id;
                    }
                }
            }

            if (bestNodeId == -1) return null; // All colored

            // Suggest smallest available color
            var targetNode = graph.Nodes.First(x => x.Id == bestNodeId);
            var neighborColors = new HashSet<int>();
            foreach (var edge in graph.Edges)
            {
                 if (edge.Source == bestNodeId) 
                 {
                     var neighbor = graph.Nodes.FirstOrDefault(x => x.Id == edge.Target);
                     if(neighbor != null && neighbor.ColorIndex != -1) neighborColors.Add(neighbor.ColorIndex);
                 }
                 else if (edge.Target == bestNodeId)
                 {
                     var neighbor = graph.Nodes.FirstOrDefault(x => x.Id == edge.Source);
                     if(neighbor != null && neighbor.ColorIndex != -1) neighborColors.Add(neighbor.ColorIndex);
                 }
            }

            int suggestedColor = 0;
            while(neighborColors.Contains(suggestedColor)) suggestedColor++;

            return new { nodeId = bestNodeId, colorIndex = suggestedColor };
        }
    }
}
