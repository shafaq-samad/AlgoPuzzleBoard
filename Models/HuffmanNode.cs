namespace AlgoPuzzleBoard.MVC.Models
{
    public class HuffmanNode : IComparable<HuffmanNode>
    {
        public char Character { get; set; }
        public int Frequency { get; set; }
        public HuffmanNode? Left { get; set; }
        public HuffmanNode? Right { get; set; }

        public int CompareTo(HuffmanNode? other)
        {
            if (other == null) return 1;
            return Frequency.CompareTo(other.Frequency);
        }
    }

    public class HuffmanResult
    {
        public Dictionary<char, string> Codes { get; set; } = new();
        public string EncodedText { get; set; } = string.Empty;
        public HuffmanTreeNode? TreeRoot { get; set; }
        public int OriginalSize { get; set; }
        public int CompressedSize { get; set; }
    }

    // Simplified node for JSON serialization
    public class HuffmanTreeNode
    {
        public char Character { get; set; }
        public int Frequency { get; set; }
        public HuffmanTreeNode? Left { get; set; }
        public HuffmanTreeNode? Right { get; set; }
    }
}
