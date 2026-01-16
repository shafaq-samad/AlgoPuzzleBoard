namespace AlgoPuzzleBoard.MVC.Models
{
    public class BinarySearchStep
    {
        public int[] Array { get; set; } = new int[0];
        public string Description { get; set; } = string.Empty;
        public int Low { get; set; } = -1;
        public int High { get; set; } = -1;
        public int Mid { get; set; } = -1;
        public bool IsFound { get; set; } = false;
        public bool IsNotFound { get; set; } = false;
        public int Target { get; set; }
    }

    public class BinarySearchResult
    {
        public List<BinarySearchStep> Steps { get; set; } = new List<BinarySearchStep>();
        public int Comparisons { get; set; }
        public int FoundIndex { get; set; } = -1;
    }
}
