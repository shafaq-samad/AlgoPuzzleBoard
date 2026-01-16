namespace AlgoPuzzleBoard.MVC.Models
{
    public class BubbleSortStep
    {
        public int[] Array { get; set; } = new int[0];
        public int CompareIndex1 { get; set; } = -1;
        public int CompareIndex2 { get; set; } = -1;
        public bool Swapped { get; set; }
        public string Description { get; set; } = string.Empty;
        public int PassNumber { get; set; }
        public int[] SortedIndices { get; set; } = new int[0];
    }

    public class BubbleSortResult
    {
        public List<BubbleSortStep> Steps { get; set; } = new List<BubbleSortStep>();
        public string TimeComplexity { get; set; } = "O(n²)";
        public string SpaceComplexity { get; set; } = "O(1)";
        public int TotalComparisons { get; set; }
        public int TotalSwaps { get; set; }
    }
}
