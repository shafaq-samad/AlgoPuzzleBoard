using AlgoPuzzleBoard.MVC.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class BFSGraphService
    {
        private Random _rand = new Random();

        public BFSGraphData GenerateRandomGraph(int nodeCount)
        {
            var data = new BFSGraphData();
            if (nodeCount < 1) return data;

            // Generate Nodes
            for (int i = 0; i < nodeCount; i++)
            {
                data.Nodes.Add(new BFSGraphNode
                {
                    Id = ((char)('A' + i)).ToString(),
                    X = _rand.Next(50, 750),
                    Y = _rand.Next(50, 450)
                });
            }

            // Ensure Connectivity (Spanning Tree)
            var connected = new List<string> { data.Nodes[0].Id };
            var remaining = data.Nodes.Skip(1).Select(n => n.Id).ToList();

            while (remaining.Count > 0)
            {
                string source = connected[_rand.Next(connected.Count)];
                string target = remaining[_rand.Next(remaining.Count)];
                data.Edges.Add(new BFSGraphEdge { Source = source, Target = target });
                connected.Add(target);
                remaining.Remove(target);
            }

            // Add some extra random edges
            int extraEdges = nodeCount / 2;
            for (int i = 0; i < extraEdges; i++)
            {
                string s = data.Nodes[_rand.Next(nodeCount)].Id;
                string t = data.Nodes[_rand.Next(nodeCount)].Id;
                if (s != t && !data.Edges.Any(e => (e.Source == s && e.Target == t) || (e.Source == t && e.Target == s)))
                {
                    data.Edges.Add(new BFSGraphEdge { Source = s, Target = t });
                }
            }

            return data;
        }

        public BFSGraphResult SolveBFS(List<BFSGraphNode> nodes, List<BFSGraphEdge> edges, string startNodeId)
        {
            var result = new BFSGraphResult();
            if (nodes == null || nodes.Count == 0) return result;

            var adj = new Dictionary<string, List<string>>();
            foreach (var n in nodes) adj[n.Id] = new List<string>();
            foreach (var e in edges)
            {
                adj[e.Source].Add(e.Target);
                adj[e.Target].Add(e.Source);
            }
            foreach (var key in adj.Keys) adj[key] = adj[key].OrderBy(x => x).ToList();

            var visited = new HashSet<string>();
            var queue = new Queue<string>();
            var traversalOrder = new List<string>();

            queue.Enqueue(startNodeId);
            visited.Add(startNodeId);
            
            result.Steps.Add(new BFSGraphStep {
                Description = $"Start BFS at node {startNodeId}. Add to queue.",
                CurrentNodeId = startNodeId,
                Visited = new List<string>(visited),
                Queue = queue.ToList(),
                Type = "Enqueue"
            });

            while (queue.Count > 0)
            {
                string currentId = queue.Dequeue();
                traversalOrder.Add(currentId);

                result.Steps.Add(new BFSGraphStep {
                    Description = $"Dequeue {currentId} and visit.",
                    CurrentNodeId = currentId,
                    Visited = new List<string>(visited),
                    Queue = queue.ToList(),
                    Type = "Visit"
                });

                foreach (var neighbor in adj[currentId])
                {
                    if (!visited.Contains(neighbor))
                    {
                        visited.Add(neighbor);
                        queue.Enqueue(neighbor);

                        result.Steps.Add(new BFSGraphStep {
                            Description = $"Found unvisited neighbor {neighbor} of {currentId}. Add to queue.",
                            CurrentNodeId = neighbor,
                            ParentNodeId = currentId,
                            Visited = new List<string>(visited),
                            Queue = queue.ToList(),
                            Type = "Enqueue"
                        });
                    }
                }
            }

            result.TraversalOrder = traversalOrder;
            return result;
        }
    }
}
