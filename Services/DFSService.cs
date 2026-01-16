using AlgoPuzzleBoard.MVC.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class DFSService
    {
        private Random _rand = new Random();

        public DFSTree GenerateRandomBST(int nodeCount)
        {
            var tree = new DFSTree();
            if (nodeCount < 1) return tree;

            var values = new List<int>();
            while (values.Count < nodeCount)
            {
                int val = _rand.Next(1, 100);
                if (!values.Contains(val)) values.Add(val);
            }

            string? rootId = null;
            var nodeMap = new Dictionary<string, DFSNode>();

            for (int i = 0; i < values.Count; i++)
            {
                string id = ((char)('A' + i)).ToString();
                var node = new DFSNode { Id = id, Value = values[i] };
                tree.Nodes.Add(node);
                nodeMap[id] = node;

                if (rootId == null) rootId = id;
                else InsertIntoBST(tree, nodeMap, rootId, id, values[i]);
            }
            return tree;
        }

        private void InsertIntoBST(DFSTree tree, Dictionary<string, DFSNode> nodeMap, string rootId, string newNodeId, int value)
        {
            string currentId = rootId;
            while (true)
            {
                var currentNode = nodeMap[currentId];
                if (value < currentNode.Value)
                {
                    var leftEdge = tree.Edges.FirstOrDefault(e => e.Source == currentId && nodeMap[e.Target].Value < currentNode.Value);
                    if (leftEdge == null) { tree.Edges.Add(new DFSEdge { Source = currentId, Target = newNodeId }); break; }
                    else currentId = leftEdge.Target;
                }
                else
                {
                    var rightEdge = tree.Edges.FirstOrDefault(e => e.Source == currentId && nodeMap[e.Target].Value >= currentNode.Value);
                    if (rightEdge == null) { tree.Edges.Add(new DFSEdge { Source = currentId, Target = newNodeId }); break; }
                    else currentId = rightEdge.Target;
                }
            }
        }

        public DFSResult SolveDFS(List<DFSNode> nodes, List<DFSEdge> edges, string startNodeId, string traversalType)
        {
            var result = new DFSResult();
            if (nodes == null || nodes.Count == 0) return result;

            var adj = new Dictionary<string, (string? Left, string? Right)>();
            foreach (var n in nodes) adj[n.Id] = (null, null);

            var nodeMap = nodes.ToDictionary(n => n.Id);

            foreach (var e in edges)
            {
                if (string.IsNullOrEmpty(e.Source) || string.IsNullOrEmpty(e.Target) || !nodeMap.ContainsKey(e.Source) || !nodeMap.ContainsKey(e.Target))
                    continue;

                var parent = nodeMap[e.Source];
                var child = nodeMap[e.Target];
                var current = adj[e.Source];
                
                if (child.Value < parent.Value) 
                    adj[e.Source] = (e.Target, current.Right);
                else 
                    adj[e.Source] = (current.Left, e.Target);
            }

            var visitedInOrder = new List<string>();
            Action<string?>? traverse = null;

            if (traversalType == "PreOrder")
            {
                traverse = (id) => {
                    if (string.IsNullOrEmpty(id) || !nodeMap.ContainsKey(id)) return;
                    visitedInOrder.Add(id);
                    result.Steps.Add(new DFSStep { CurrentNodeId = id, Description = $"Visit {nodeMap[id].Value} (Pre-order)", Type = "Visit", Visited = new List<string>(visitedInOrder) });
                    traverse!(adj[id].Left);
                    traverse!(adj[id].Right);
                };
            }
            else if (traversalType == "InOrder")
            {
                traverse = (id) => {
                    if (string.IsNullOrEmpty(id) || !nodeMap.ContainsKey(id)) return;
                    traverse!(adj[id].Left);
                    visitedInOrder.Add(id);
                    result.Steps.Add(new DFSStep { CurrentNodeId = id, Description = $"Visit {nodeMap[id].Value} (In-order)", Type = "Visit", Visited = new List<string>(visitedInOrder) });
                    traverse!(adj[id].Right);
                };
            }
            else if (traversalType == "PostOrder")
            {
                traverse = (id) => {
                    if (string.IsNullOrEmpty(id) || !nodeMap.ContainsKey(id)) return;
                    traverse!(adj[id].Left);
                    traverse!(adj[id].Right);
                    visitedInOrder.Add(id);
                    result.Steps.Add(new DFSStep { CurrentNodeId = id, Description = $"Visit {nodeMap[id].Value} (Post-order)", Type = "Visit", Visited = new List<string>(visitedInOrder) });
                };
            }

            // identify root (node with no incoming edges) or fallback to nodes[0]
            var targets = new HashSet<string>(edges.Select(e => e.Target));
            var root = nodes.FirstOrDefault(n => !targets.Contains(n.Id)) ?? nodes[0];

            if (traverse != null)
            {
                traverse(root.Id);
            }
            
            result.TraversalOrder = visitedInOrder.Select(id => nodeMap[id].Value.ToString()).ToList();
            return result;
        }
    }
}
