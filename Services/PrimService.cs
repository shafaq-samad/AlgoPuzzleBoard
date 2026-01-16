using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class PrimService
    {
        public PrimResult SolvePrim(List<PrimNode> nodes, List<PrimEdge> edges, string? startNodeId = null)
        {
            var result = new PrimResult();
            if (nodes.Count == 0) return result;

            // Adjacency List
            var adj = new Dictionary<string, List<PrimEdge>>();
            foreach (var node in nodes) adj[node.Id] = new List<PrimEdge>();
            
            // Note: Edges are undirected, add both ways
            foreach (var edge in edges)
            {
                // Ensure internal data structure integrity
                if (!adj.ContainsKey(edge.Source)) adj[edge.Source] = new List<PrimEdge>();
                if (!adj.ContainsKey(edge.Target)) adj[edge.Target] = new List<PrimEdge>();

                adj[edge.Source].Add(edge);
                adj[edge.Target].Add(edge);
            }

            // Start Node Logic
            if (string.IsNullOrEmpty(startNodeId) || !nodes.Any(n => n.Id == startNodeId))
            {
                startNodeId = nodes.OrderBy(n => n.Id).First().Id;
            }

            var visited = new HashSet<string>();
            visited.Add(startNodeId);

            // Priority Queue logic (since C# PriorityQueue is newer, we can use a sorted list or just list and sort for O(E log E) which is fine for small graphs)
            // Storing (Edge, TargetNode)
            // But we need to track the specific edge object for consistency
            
            // Candidate Edges: Edges connected to Visited set, leading to Unvisited nodes.
            // Simplified approach for Step recording:
            // 1. Find all edges connecting Visited -> Unvisited.
            // 2. Pick min. 
            // 3. Repeat. 
            // This is O(V * E) but fine for V=6.

            while (visited.Count < nodes.Count)
            {
                var candidates = new List<PrimEdge>();

                // Find all valid cuts
                foreach (var edge in edges)
                {
                    bool srcVisited = visited.Contains(edge.Source);
                    bool tgtVisited = visited.Contains(edge.Target);

                    // XOR: Only one endpoint visited
                    if (srcVisited ^ tgtVisited)
                    {
                        candidates.Add(edge);
                    }
                }

                if (candidates.Count == 0) break; // Disconnected graph

                // Sort by weight
                var bestEdge = candidates.OrderBy(e => e.Weight).First();

                // Add step: Checking best edge
                result.Steps.Add(new PrimStep 
                { 
                    Edge = bestEdge, 
                    Status = "Checking",
                    Description = $"Checking minimal edge from frontier: {bestEdge.Source}-{bestEdge.Target} ({bestEdge.Weight})"
                });

                // Accept
                result.MSTEdges.Add(bestEdge);
                result.TotalWeight += bestEdge.Weight;
                result.Steps.Add(new PrimStep 
                { 
                    Edge = bestEdge, 
                    Status = "Accepted",
                    Description = $"Accepted {bestEdge.Source}-{bestEdge.Target}"
                });

                // Update visited
                if (visited.Contains(bestEdge.Source))
                    visited.Add(bestEdge.Target);
                else
                    visited.Add(bestEdge.Source);
            }
            
            // Mark remaining edges as rejected or just ignore?
            // Kruskal's marks rejected cycles. Prim's doesn't really "reject" unless we iterate differently.
            // For visualization, we only show Accepted steps mostly, but we can highlight others if we want.
            // Let's stick to showing the growth.

            result.Success = true;
            return result;
        }

        public PrimGraph GenerateRandomGraph(int nodeCount)
        {
            var graph = new PrimGraph();
            var rand = new Random();
            int width = 800; 
            int height = 500; 

            for (int i = 0; i < nodeCount; i++)
            {
                graph.Nodes.Add(new PrimNode
                {
                    Id = ((char)('A' + i)).ToString(),
                    X = rand.Next(50, width - 50),
                    Y = rand.Next(50, height - 50)
                });
            }

            // Ensure Connectivity
            for (int i = 0; i < nodeCount - 1; i++)
            {
                AddEdge(graph, i, i + 1, rand);
            }

            int extraEdges = nodeCount; 
            for (int k = 0; k < extraEdges; k++)
            {
                int i = rand.Next(0, nodeCount);
                int j = rand.Next(0, nodeCount);
                if (i != j) AddEdge(graph, i, j, rand);
            }

            return graph;
        }

        private void AddEdge(PrimGraph graph, int idx1, int idx2, Random rand)
        {
            var n1 = graph.Nodes[idx1];
            var n2 = graph.Nodes[idx2];
            
            if (graph.Edges.Any(e => (e.Source == n1.Id && e.Target == n2.Id) || (e.Source == n2.Id && e.Target == n1.Id)))
                return;

            int dist = (int)Math.Sqrt(Math.Pow(n1.X - n2.X, 2) + Math.Pow(n1.Y - n2.Y, 2)) / 5;
            int weight = rand.Next(dist - 5, dist + 10);
            if (weight < 1) weight = 1;

            graph.Edges.Add(new PrimEdge
            {
                Source = n1.Id,
                Target = n2.Id,
                Weight = weight
            });
        }
    }
}
