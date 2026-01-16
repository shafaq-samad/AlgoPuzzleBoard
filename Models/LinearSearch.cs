namespace AlgoPuzzleBoard.MVC.Models
{
    public class SearchRequest
    {
        public int[] Array { get; set; } = new int[0];
        public int Target { get; set; }
    }

    public class LinearSearchStep
    {
        public int[] Array { get; set; } = new int[0];
        public string Description { get; set; } = string.Empty;
        public int CurrentIndex { get; set; } = -1; // Index currently being checked
        public bool IsFound { get; set; } = false; // True if target found at CurrentIndex
        public bool IsNotFound { get; set; } = false; // True if end of array reached without finding
        public int Target { get; set; }
    }

    public class LinearSearchResult
    {
        public List<LinearSearchStep> Steps { get; set; } = new List<LinearSearchStep>();
        public int Comparisons { get; set; }
        public int FoundIndex { get; set; } = -1;
    }
}
