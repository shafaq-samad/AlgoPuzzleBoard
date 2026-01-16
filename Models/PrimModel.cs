namespace AlgoPuzzleBoard.MVC.Models
{
    public class PrimNode
    {
        public string Id { get; set; } = string.Empty;
        public double X { get; set; }
        public double Y { get; set; }
    }

    public class PrimEdge
    {
        public string Source { get; set; } = string.Empty;
        public string Target { get; set; } = string.Empty;
        public int Weight { get; set; }
    }

    public class PrimGraph
    {
        public List<PrimNode> Nodes { get; set; } = new();
        public List<PrimEdge> Edges { get; set; } = new();
    }

    public class PrimSolveRequest
    {
        public List<PrimNode> Nodes { get; set; } = new();
        public List<PrimEdge> Edges { get; set; } = new();
        public string StartNodeId { get; set; } = string.Empty; // Optional start node
    }

    public class PrimStep
    {
        public PrimEdge Edge { get; set; } = new();
        public string Status { get; set; } = string.Empty; // "Checking", "Accepted", "Rejected"
        public string Description { get; set; } = string.Empty;
    }

    public class PrimResult
    {
        public List<PrimEdge> MSTEdges { get; set; } = new();
        public int TotalWeight { get; set; }
        public List<PrimStep> Steps { get; set; } = new();
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
