using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class HuffmanService
    {
        public class HuffmanNode
        {
            public char Character { get; set; }
            public int Frequency { get; set; }
            public HuffmanNode? Left { get; set; }
            public HuffmanNode? Right { get; set; }
        }

        public HuffmanNode BuildTree(string input)
        {
            var frequencies = input.GroupBy(c => c)
                                   .ToDictionary(g => g.Key, g => g.Count());

            var priorityQueue = new PriorityQueue<HuffmanNode, int>();

            foreach (var kvp in frequencies)
            {
                priorityQueue.Enqueue(new HuffmanNode { Character = kvp.Key, Frequency = kvp.Value }, kvp.Value);
            }

            // Greedy Construction
            while (priorityQueue.Count > 1)
            {
                var left = priorityQueue.Dequeue();
                var right = priorityQueue.Dequeue();

                var parent = new HuffmanNode
                {
                    Character = '*', // Internal node
                    Frequency = left.Frequency + right.Frequency,
                    Left = left,
                    Right = right
                };

                priorityQueue.Enqueue(parent, parent.Frequency);
            }

            return priorityQueue.Dequeue();
        }

        public Dictionary<char, string> GenerateCodes(HuffmanNode root)
        {
            var codes = new Dictionary<char, string>();
            GenerateCodesRecursive(root, "", codes);
            return codes;
        }

        private void GenerateCodesRecursive(HuffmanNode? node, string code, Dictionary<char, string> codes)
        {
            if (node == null) return;

            if (node.Left == null && node.Right == null)
            {
                codes[node.Character] = code;
            }

            GenerateCodesRecursive(node.Left, code + "0", codes);
            GenerateCodesRecursive(node.Right, code + "1", codes);
        }
        public HuffmanResult BuildHuffmanTree(string text)
        {
            if (string.IsNullOrEmpty(text))
                return new HuffmanResult();

            var root = BuildTree(text);
            var codes = GenerateCodes(root);

            var treeRoot = MapToTreeNode(root);

            int originalSize = text.Length * 8;
            int compressedSize = 0;
            var sb = new System.Text.StringBuilder();
            foreach (var c in text)
            {
                if (codes.ContainsKey(c))
                {
                    sb.Append(codes[c]);
                    compressedSize += codes[c].Length;
                }
            }

            return new HuffmanResult
            {
                Codes = codes,
                EncodedText = sb.ToString(),
                TreeRoot = treeRoot,
                OriginalSize = originalSize,
                CompressedSize = compressedSize
            };
        }

        public string Decode(string encoded, HuffmanTreeNode? treeRoot)
        {
            if (string.IsNullOrEmpty(encoded) || treeRoot == null)
                return "";

            var sb = new System.Text.StringBuilder();
            var current = treeRoot;

            foreach (var bit in encoded)
            {
                if (bit == '0')
                    current = current.Left;
                else
                    current = current.Right;

                if (current == null) break; // Should not happen in valid encoding

                if (current.Left == null && current.Right == null)
                {
                    sb.Append(current.Character);
                    current = treeRoot;
                }
            }

            return sb.ToString();
        }

        private HuffmanTreeNode? MapToTreeNode(HuffmanNode? node)
        {
            if (node == null) return null;
            return new HuffmanTreeNode
            {
                Character = node.Character,
                Frequency = node.Frequency,
                Left = MapToTreeNode(node.Left),
                Right = MapToTreeNode(node.Right)
            };
        }

        public object? GetNextMergeStep(Dictionary<char, int> currentFrequencies)
        {
            // Suggest merging the two characters/nodes with lowest frequency
            if (currentFrequencies.Count < 2) return null;

            var sorted = currentFrequencies.OrderBy(x => x.Value).Take(2).ToList();
            return new { 
                merge = new { 
                     leftChar = sorted[0].Key, 
                     leftFreq = sorted[0].Value,
                     rightChar = sorted[1].Key,
                     rightFreq = sorted[1].Value
                }
            };
        }
    }
}
