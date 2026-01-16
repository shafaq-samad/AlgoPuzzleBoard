using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class KruskalService
    {
        public KruskalResult SolveKruskal(List<KruskalNode> nodes, List<KruskalEdge> edges)
        {
            var result = new KruskalResult();
            var sortedEdges = edges.OrderBy(e => e.Weight).ToList();
            
            // Union-Find Initialization
            var parent = new Dictionary<string, string>();
            foreach (var node in nodes)
            {
                parent[node.Id] = node.Id;
            }

            string Find(string i)
            {
                if (parent[i] == i)
                    return i;
                return parent[i] = Find(parent[i]); // Path compression
            }

            void Union(string i, string j)
            {
                string rootI = Find(i);
                string rootJ = Find(j);
                if (rootI != rootJ)
                {
                    parent[rootI] = rootJ;
                }
            }

            foreach (var edge in sortedEdges)
            {
                // Step 1: Checking
                result.Steps.Add(new KruskalStep { Edge = edge, Status = "Checking" });

                string rootSource = Find(edge.Source);
                string rootTarget = Find(edge.Target);

                if (rootSource != rootTarget)
                {
                    // No cycle, accept edge
                    Union(edge.Source, edge.Target);
                    result.MSTEdges.Add(edge);
                    result.TotalWeight += edge.Weight;
                    result.Steps.Add(new KruskalStep { Edge = edge, Status = "Accepted" });
                }
                else
                {
                    // Cycle detected, reject edge
                    result.Steps.Add(new KruskalStep { Edge = edge, Status = "Rejected" });
                }
            }

            result.Success = true;
            return result;
        }

        public KruskalGraph GenerateRandomGraph(int nodeCount)
        {
            var graph = new KruskalGraph();
            var rand = new Random();
            int width = 800; // Canvas width approx
            int height = 500; // Canvas height approx

            // Generate Nodes
            for (int i = 0; i < nodeCount; i++)
            {
                graph.Nodes.Add(new KruskalNode
                {
                    Id = ((char)('A' + i)).ToString(), // Using A, B, C... for readability
                    X = rand.Next(50, width - 50),
                    Y = rand.Next(50, height - 50)
                });
            }

            // Generate Edges (Randomly connect)
            // Strategy: Connected graph logic
            // 1. Ensure spanning path first (0-1, 1-2, ...) to fail-safe connectivity
            for (int i = 0; i < nodeCount - 1; i++)
            {
                AddEdge(graph, i, i + 1, rand);
            }

            // 2. Add random other edges to create cycles (so MST is meaningful)
            int extraEdges = nodeCount; 
            for (int k = 0; k < extraEdges; k++)
            {
                int i = rand.Next(0, nodeCount);
                int j = rand.Next(0, nodeCount);
                if (i != j) AddEdge(graph, i, j, rand);
            }

            return graph;
        }

        private void AddEdge(KruskalGraph graph, int idx1, int idx2, Random rand)
        {
            var n1 = graph.Nodes[idx1];
            var n2 = graph.Nodes[idx2];
            
            // Avoid duplicates
            if (graph.Edges.Any(e => (e.Source == n1.Id && e.Target == n2.Id) || (e.Source == n2.Id && e.Target == n1.Id)))
                return;

            // Euclidean distance as partial factor but randomized for puzzle interest
            int dist = (int)Math.Sqrt(Math.Pow(n1.X - n2.X, 2) + Math.Pow(n1.Y - n2.Y, 2)) / 5;
            int weight = rand.Next(dist - 5, dist + 10);
            if (weight < 1) weight = 1;

            graph.Edges.Add(new KruskalEdge
            {
                Source = n1.Id,
                Target = n2.Id,
                Weight = weight
            });
        }
    }
}
