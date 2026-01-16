namespace AlgoPuzzleBoard.MVC.Models
{
    public class HeapSortStep
    {
        public int[] Array { get; set; } = new int[0];
        public int CompareIndex1 { get; set; }
        public int CompareIndex2 { get; set; }
        public bool Swapped { get; set; }
        public string Description { get; set; } = string.Empty;
        public int[] SortedIndices { get; set; } = new int[0];
        public int HeapSize { get; set; }
    }

    public class HeapSortResult
    {
        public List<HeapSortStep> Steps { get; set; } = new List<HeapSortStep>();
        public int TotalComparisons { get; set; }
        public int TotalSwaps { get; set; }
    }
}
