namespace AlgoPuzzleBoard.MVC.Models
{
    public class KruskalNode
    {
        public string Id { get; set; } = string.Empty;
        public double X { get; set; }
        public double Y { get; set; }
    }

    public class KruskalEdge
    {
        public string Source { get; set; } = string.Empty;
        public string Target { get; set; } = string.Empty;
        public int Weight { get; set; }
    }

    public class KruskalGraph
    {
        public List<KruskalNode> Nodes { get; set; } = new();
        public List<KruskalEdge> Edges { get; set; } = new();
    }

    public class KruskalSolveRequest
    {
        public List<KruskalNode> Nodes { get; set; } = new();
        public List<KruskalEdge> Edges { get; set; } = new();
    }

    public class KruskalStep
    {
        public KruskalEdge Edge { get; set; } = new();
        public string Status { get; set; } = string.Empty; // "Checking", "Accepted", "Rejected"
    }

    public class KruskalResult
    {
        public List<KruskalEdge> MSTEdges { get; set; } = new();
        public int TotalWeight { get; set; }
        public List<KruskalStep> Steps { get; set; } = new();
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
