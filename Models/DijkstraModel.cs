namespace AlgoPuzzleBoard.MVC.Models
{
    public class DijkstraNode
    {
        public string Id { get; set; } = string.Empty;
        public double X { get; set; }
        public double Y { get; set; }
    }

    public class DijkstraEdge
    {
        public string Source { get; set; } = string.Empty;
        public string Target { get; set; } = string.Empty;
        public int Weight { get; set; }
    }

    public class DijkstraGraph
    {
        public List<DijkstraNode> Nodes { get; set; } = new();
        public List<DijkstraEdge> Edges { get; set; } = new();
    }

    public class DijkstraSolveRequest
    {
        public List<DijkstraNode> Nodes { get; set; } = new();
        public List<DijkstraEdge> Edges { get; set; } = new();
        public string StartNodeId { get; set; } = string.Empty;
        public string TargetNodeId { get; set; } = string.Empty;
    }

    public class DijkstraResult
    {
        public List<string> Path { get; set; } = new(); // List of Node IDs
        public int TotalDistance { get; set; }
        public List<string> VisitedOrder { get; set; } = new(); // For animation
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
