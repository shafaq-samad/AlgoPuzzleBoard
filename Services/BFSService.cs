using AlgoPuzzleBoard.MVC.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class BFSService
    {
        private Random _rand = new Random();

        public BFSTree GenerateRandomBST(int nodeCount)
        {
            var tree = new BFSTree();
            if (nodeCount < 1) return tree;

            // Generate unique random values for BST
            var values = new List<int>();
            while (values.Count < nodeCount)
            {
                int val = _rand.Next(1, 100);
                if (!values.Contains(val)) values.Add(val);
            }

            // Build BST by inserting values
            string? rootId = null;
            var nodeMap = new Dictionary<string, BFSNode>();

            for (int i = 0; i < values.Count; i++)
            {
                string id = ((char)('A' + i)).ToString();
                var node = new BFSNode { Id = id, Value = values[i] };
                tree.Nodes.Add(node);
                nodeMap[id] = node;

                if (rootId == null)
                {
                    rootId = id;
                }
                else
                {
                    // Insert into BST
                    InsertIntoBST(tree, nodeMap, rootId, id, values[i]);
                }
            }

            return tree;
        }

        private void InsertIntoBST(BFSTree tree, Dictionary<string, BFSNode> nodeMap, string rootId, string newNodeId, int value)
        {
            string currentId = rootId;
            
            while (true)
            {
                var currentNode = nodeMap[currentId];
                
                if (value < currentNode.Value)
                {
                    // Go left
                    var leftEdge = tree.Edges.FirstOrDefault(e => e.Source == currentId && 
                        nodeMap[e.Target].Value < currentNode.Value);
                    
                    if (leftEdge == null)
                    {
                        tree.Edges.Add(new BFSEdge { Source = currentId, Target = newNodeId });
                        break;
                    }
                    else
                    {
                        currentId = leftEdge.Target;
                    }
                }
                else
                {
                    // Go right
                    var rightEdge = tree.Edges.FirstOrDefault(e => e.Source == currentId && 
                        nodeMap[e.Target].Value > currentNode.Value);
                    
                    if (rightEdge == null)
                    {
                        tree.Edges.Add(new BFSEdge { Source = currentId, Target = newNodeId });
                        break;
                    }
                    else
                    {
                        currentId = rightEdge.Target;
                    }
                }
            }
        }

        public BFSResult SolveBFS(List<BFSNode> nodes, List<BFSEdge> edges, string startNodeId)
        {
            var result = new BFSResult();
            if (nodes.Count == 0) return result;

            // Validate start node
            if (string.IsNullOrEmpty(startNodeId) || !nodes.Any(n => n.Id == startNodeId))
            {
                startNodeId = nodes.First().Id;
            }

            // Build adjacency list
            var adj = new Dictionary<string, List<string>>();
            foreach (var n in nodes) adj[n.Id] = new List<string>();

            foreach (var e in edges)
            {
                adj[e.Source].Add(e.Target);
            }

            // BFS using level-order traversal (no explicit queue in visualization)
            var visited = new HashSet<string>();
            var currentLevel = new List<string> { startNodeId };
            
            visited.Add(startNodeId);
            result.TraversalOrder.Add(startNodeId);

            result.Steps.Add(new BFSStep
            {
                Description = $"Start BFS at node {startNodeId}",
                CurrentNodeId = startNodeId,
                Visited = new List<string>(visited),
                Type = "Visit"
            });

            while (currentLevel.Count > 0)
            {
                var nextLevel = new List<string>();

                foreach (var nodeId in currentLevel)
                {
                    // Visit children
                    foreach (var child in adj[nodeId].OrderBy(x => x))
                    {
                        if (!visited.Contains(child))
                        {
                            visited.Add(child);
                            result.TraversalOrder.Add(child);
                            nextLevel.Add(child);

                            result.Steps.Add(new BFSStep
                            {
                                Description = $"Visit node {child}",
                                CurrentNodeId = child,
                                Visited = new List<string>(visited),
                                Type = "Visit"
                            });
                        }
                    }
                }

                currentLevel = nextLevel;
            }

            return result;
        }
    }
}
