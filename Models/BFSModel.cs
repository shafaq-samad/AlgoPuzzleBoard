using System.Text.Json.Serialization;

namespace AlgoPuzzleBoard.MVC.Models
{
    public class BFSNode
    {
        public string Id { get; set; } = "";
        public int Value { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
    }

    public class BFSEdge
    {
        public string Source { get; set; } = "";
        public string Target { get; set; } = "";
    }

    public class BFSTree
    {
        public List<BFSNode> Nodes { get; set; } = new();
        public List<BFSEdge> Edges { get; set; } = new();
    }

    public class BFSSolveRequest
    {
        public List<BFSNode> Nodes { get; set; } = new();
        public List<BFSEdge> Edges { get; set; } = new();
        public string StartNodeId { get; set; } = "";
    }

    public class BFSStep
    {
        public string Description { get; set; } = "";
        public string CurrentNodeId { get; set; } = "";
        public List<string> Visited { get; set; } = new();
        public string Type { get; set; } = ""; // "Visit", "Highlight"
    }

    public class BFSResult
    {
        public List<BFSStep> Steps { get; set; } = new();
        public List<string> TraversalOrder { get; set; } = new();
    }
}
