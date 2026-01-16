using AlgoPuzzleBoard.MVC.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class DFSGraphService
    {
        private Random _rand = new Random();

        public DFSGraphData GenerateRandomGraph(int nodeCount)
        {
            var data = new DFSGraphData();
            if (nodeCount < 1) return data;

            // Generate Nodes
            for (int i = 0; i < nodeCount; i++)
            {
                data.Nodes.Add(new DFSGraphNode
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
                data.Edges.Add(new DFSGraphEdge { Source = source, Target = target });
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
                    data.Edges.Add(new DFSGraphEdge { Source = s, Target = t });
                }
            }

            return data;
        }

        public DFSGraphResult SolveDFS(List<DFSGraphNode> nodes, List<DFSGraphEdge> edges, string startNodeId)
        {
            var result = new DFSGraphResult();
            if (nodes == null || nodes.Count == 0) return result;

            var adj = new Dictionary<string, List<string>>();
            foreach (var n in nodes) adj[n.Id] = new List<string>();
            foreach (var e in edges)
            {
                adj[e.Source].Add(e.Target);
                adj[e.Target].Add(e.Source);
            }
            // Sort neighbors in descending order so they are processed in ascending order from the stack
            foreach (var key in adj.Keys) adj[key] = adj[key].OrderByDescending(x => x).ToList();

            var visited = new HashSet<string>();
            var stack = new Stack<string>();
            var traversalOrder = new List<string>();

            stack.Push(startNodeId);
            
            result.Steps.Add(new DFSGraphStep {
                Description = $"Push start node {startNodeId} to stack.",
                CurrentNodeId = startNodeId,
                Visited = new List<string>(visited),
                Stack = stack.Reverse().ToList(),
                Type = "Push"
            });

            while (stack.Count > 0)
            {
                string currentId = stack.Pop();

                if (!visited.Contains(currentId))
                {
                    visited.Add(currentId);
                    traversalOrder.Add(currentId);

                    result.Steps.Add(new DFSGraphStep {
                        Description = $"Pop {currentId} from stack and visit it.",
                        CurrentNodeId = currentId,
                        Visited = new List<string>(visited),
                        Stack = stack.Reverse().ToList(),
                        Type = "Visit"
                    });

                    foreach (var neighbor in adj[currentId])
                    {
                        if (!visited.Contains(neighbor))
                        {
                            stack.Push(neighbor);
                            result.Steps.Add(new DFSGraphStep {
                                Description = $"Found unvisited neighbor {neighbor} of {currentId}. Push to stack.",
                                CurrentNodeId = neighbor,
                                ParentNodeId = currentId,
                                Visited = new List<string>(visited),
                                Stack = stack.Reverse().ToList(),
                                Type = "Push"
                            });
                        }
                    }
                }
                else
                {
                     result.Steps.Add(new DFSGraphStep {
                        Description = $"{currentId} already visited. Discarding.",
                        CurrentNodeId = currentId,
                        Visited = new List<string>(visited),
                        Stack = stack.Reverse().ToList(),
                        Type = "Discard"
                    });
                }
            }

            result.TraversalOrder = traversalOrder;
            return result;
        }
    }
}
