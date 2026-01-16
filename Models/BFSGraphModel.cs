using System.Text.Json.Serialization;

namespace AlgoPuzzleBoard.MVC.Models
{
    public class BFSGraphNode
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = "";
        [JsonPropertyName("x")]
        public double X { get; set; }
        [JsonPropertyName("y")]
        public double Y { get; set; }
    }

    public class BFSGraphEdge
    {
        [JsonPropertyName("source")]
        public string Source { get; set; } = "";
        [JsonPropertyName("target")]
        public string Target { get; set; } = "";
    }

    public class BFSGraphData
    {
        [JsonPropertyName("nodes")]
        public List<BFSGraphNode> Nodes { get; set; } = new();
        [JsonPropertyName("edges")]
        public List<BFSGraphEdge> Edges { get; set; } = new();
    }

    public class BFSGraphSolveRequest
    {
        [JsonPropertyName("nodes")]
        public List<BFSGraphNode> Nodes { get; set; } = new();
        [JsonPropertyName("edges")]
        public List<BFSGraphEdge> Edges { get; set; } = new();
        [JsonPropertyName("startNodeId")]
        public string StartNodeId { get; set; } = "";
    }

    public class BFSGraphStep
    {
        [JsonPropertyName("description")]
        public string Description { get; set; } = "";
        [JsonPropertyName("currentNodeId")]
        public string CurrentNodeId { get; set; } = "";
        [JsonPropertyName("parentNodeId")]
        public string ParentNodeId { get; set; } = "";
        [JsonPropertyName("visited")]
        public List<string> Visited { get; set; } = new();
        [JsonPropertyName("queue")]
        public List<string> Queue { get; set; } = new();
        [JsonPropertyName("type")]
        public string Type { get; set; } = ""; // "Visit", "Enqueue", "Dequeue"
    }

    public class BFSGraphResult
    {
        [JsonPropertyName("steps")]
        public List<BFSGraphStep> Steps { get; set; } = new();
        [JsonPropertyName("traversalOrder")]
        public List<string> TraversalOrder { get; set; } = new();
    }
}
