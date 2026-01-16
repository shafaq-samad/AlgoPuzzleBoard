namespace AlgoPuzzleBoard.MVC.Models
{
    public class InterpolationSearchStep
    {
        public int[] Array { get; set; } = new int[0];
        public string Description { get; set; } = string.Empty;
        public int Low { get; set; } = -1;
        public int High { get; set; } = -1;
        public int Probe { get; set; } = -1; // The calculated position
        public bool IsFound { get; set; } = false;
        public bool IsNotFound { get; set; } = false;
        public int Target { get; set; }
    }

    public class InterpolationSearchResult
    {
        public List<InterpolationSearchStep> Steps { get; set; } = new List<InterpolationSearchStep>();
        public int Comparisons { get; set; }
        public int FoundIndex { get; set; } = -1;
    }
}
