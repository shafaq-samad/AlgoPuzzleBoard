using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class BSTService
    {
        private class InternalNode
        {
            public int Value;
            public InternalNode? Left;
            public InternalNode? Right;
            public string Id;

            public InternalNode(int value)
            {
                Value = value;
                Id = Guid.NewGuid().ToString();
            }
        }

        public BSTResult BuildBST(List<int> array)
        {
            var result = new BSTResult();
            InternalNode? root = null;

            foreach (var val in array)
            {
                root = Insert(root, val, result);
            }

            result.Steps.Add(new BSTStep
            {
                Description = "BST Construction Complete!",
                Type = "Complete",
                Nodes = GetNodeDataList(root),
                Edges = GetEdgeDataList(root)
            });

            return result;
        }

        private InternalNode Insert(InternalNode? node, int val, BSTResult result)
        {
            if (node == null)
            {
                var newNode = new InternalNode(val);
                result.Steps.Add(new BSTStep
                {
                    Description = $"Inserting {val} as a new leaf.",
                    Nodes = GetNodeDataList(node), // Root case might be special
                    HighlightValue = val,
                    Type = "Insert"
                });
                return newNode;
            }

            result.Steps.Add(new BSTStep
            {
                Description = $"Comparing {val} with {node.Value}.",
                CompareValue = node.Value,
                HighlightValue = val,
                Type = "Compare"
            });

            if (val < node.Value)
            {
                node.Left = Insert(node.Left, val, result);
            }
            else if (val > node.Value)
            {
                node.Right = Insert(node.Right, val, result);
            }

            // After recursion, capture the state of the tree including the new node
            result.Steps.Add(new BSTStep
            {
                Description = $"Traversing tree...",
                Nodes = GetNodeDataList(node),
                Edges = GetEdgeDataList(node),
                Type = "Info"
            });

            return node;
        }

        // We need a better way to record steps because recursive Insert with result.Steps.Add doesn't capture the full tree state correctly at each step.
        // Let's refactor BuildBST slightly.

        public BSTResult SolveBST(List<int> array)
        {
            var result = new BSTResult();
            InternalNode? root = null;

            foreach (var val in array)
            {
                root = InsertAndRecord(root, val, result);
            }

            return result;
        }

        private InternalNode InsertAndRecord(InternalNode? root, int val, BSTResult result)
        {
            if (root == null)
            {
                var newNode = new InternalNode(val);
                result.Steps.Add(new BSTStep
                {
                    Description = $"Tree is empty. Inserting {val} as root.",
                    Nodes = GetNodeDataList(newNode),
                    Edges = GetEdgeDataList(newNode),
                    HighlightValue = val,
                    Type = "Insert"
                });
                return newNode;
            }

            InternalNode current = root;
            while (true)
            {
                result.Steps.Add(new BSTStep
                {
                    Description = $"Comparing {val} with {current.Value}.",
                    CompareValue = current.Value,
                    HighlightValue = val,
                    Nodes = GetNodeDataList(root),
                    Edges = GetEdgeDataList(root),
                    Type = "Compare"
                });

                if (val < current.Value)
                {
                    if (current.Left == null)
                    {
                        current.Left = new InternalNode(val);
                        result.Steps.Add(new BSTStep
                        {
                            Description = $"{val} < {current.Value}. Inserting as left child.",
                            HighlightValue = val,
                            Nodes = GetNodeDataList(root),
                            Edges = GetEdgeDataList(root),
                            Type = "Insert"
                        });
                        break;
                    }
                    current = current.Left;
                }
                else if (val > current.Value)
                {
                    if (current.Right == null)
                    {
                        current.Right = new InternalNode(val);
                        result.Steps.Add(new BSTStep
                        {
                            Description = $"{val} > {current.Value}. Inserting as right child.",
                            HighlightValue = val,
                            Nodes = GetNodeDataList(root),
                            Edges = GetEdgeDataList(root),
                            Type = "Insert"
                        });
                        break;
                    }
                    current = current.Right;
                }
                else
                {
                    // Value already exists, usually skipped in basic BST
                    break;
                }
            }
            return root;
        }

        private List<BSTNodeData> GetNodeDataList(InternalNode? root)
        {
            var list = new List<BSTNodeData>();
            if (root == null) return list;
            CalculatePositions(root, 0, 800, 50, 80, list);
            return list;
        }

        private void CalculatePositions(InternalNode node, double left, double right, double y, double yStep, List<BSTNodeData> list)
        {
            double x = (left + right) / 2;
            list.Add(new BSTNodeData { Id = node.Id, Value = node.Value, X = x, Y = y });

            if (node.Left != null) CalculatePositions(node.Left, left, x, y + yStep, yStep, list);
            if (node.Right != null) CalculatePositions(node.Right, x, right, y + yStep, yStep, list);
        }

        private List<BSTEdgeData> GetEdgeDataList(InternalNode? root)
        {
            var list = new List<BSTEdgeData>();
            if (root == null) return list;
            TraverseEdges(root, list);
            return list;
        }

        private void TraverseEdges(InternalNode node, List<BSTEdgeData> list)
        {
            if (node.Left != null)
            {
                list.Add(new BSTEdgeData { From = node.Id, To = node.Left.Id });
                TraverseEdges(node.Left, list);
            }
            if (node.Right != null)
            {
                list.Add(new BSTEdgeData { From = node.Id, To = node.Right.Id });
                TraverseEdges(node.Right, list);
            }
        }
    }
}
