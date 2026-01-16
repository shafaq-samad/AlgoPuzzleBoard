namespace AlgoPuzzleBoard.MVC.Models
{
    public class QuickSortStep
    {
        public int[] Array { get; set; } = new int[0];
        public int CompareIndex1 { get; set; } = -1;
        public int CompareIndex2 { get; set; } = -1;
        public bool Swapped { get; set; }
        public string Description { get; set; } = string.Empty;
        public int[] SortedIndices { get; set; } = new int[0];
        
        // Quick Sort specific visualization properties
        public int PivotIndex { get; set; } = -1;
        public int LeftIndex { get; set; } = -1; // Partition start
        public int RightIndex { get; set; } = -1; // Partition end
        public int CurrentIndex { get; set; } = -1; // Current element being compared
        public bool IsPivotPlaced { get; set; } = false;
        public bool IsSorted { get; set; } = false;
    }

    public class QuickSortResult
    {
        public List<QuickSortStep> Steps { get; set; } = new List<QuickSortStep>();
        public int TotalComparisons { get; set; }
        public int TotalSwaps { get; set; }
    }
}
