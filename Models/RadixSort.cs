namespace AlgoPuzzleBoard.MVC.Models
{
    public class RadixSortStep
    {
        public int[] Array { get; set; } = new int[0];
        public string Description { get; set; } = string.Empty;
        public int[] SortedIndices { get; set; } = new int[0];
        public bool IsSorted { get; set; } = false;

        // Radix Sort specific visualization properties
        public int CurrentDigitPlace { get; set; } = 1; // 1, 10, 100, etc.
        public int CurrentDigitValue { get; set; } = -1; // The specific digit value (0-9) being processed (optional)
        public int[] BucketCounts { get; set; } = new int[0]; // Count of items in each bucket (0-9)
        public bool IsDistributing { get; set; } = false; // Phase 1: Distributing to buckets
        public bool IsCollecting { get; set; } = false;   // Phase 2: Collecting back to array
    }

    public class RadixSortResult
    {
        public List<RadixSortStep> Steps { get; set; } = new List<RadixSortStep>();
        public int TotalPassthroughs { get; set; } // Number of digits processed
    }
}
