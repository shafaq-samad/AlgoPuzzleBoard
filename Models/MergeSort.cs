namespace AlgoPuzzleBoard.MVC.Models
{
    public class MergeSortStep
    {
        public int[] Array { get; set; } = new int[0];
        public int CompareIndex1 { get; set; } = -1;
        public int CompareIndex2 { get; set; } = -1;
        public bool Swapped { get; set; }
        public string Description { get; set; } = string.Empty;
        public int[] SortedIndices { get; set; } = new int[0];
        public int LeftIndex { get; set; } = -1;
        public int RightIndex { get; set; } = -1;
        public int[] MergingRange { get; set; } = new int[0];
    }

    public class MergeSortResult
    {
        public List<MergeSortStep> Steps { get; set; } = new List<MergeSortStep>();
        public int TotalComparisons { get; set; }
        public int TotalMerges { get; set; }
    }
}
