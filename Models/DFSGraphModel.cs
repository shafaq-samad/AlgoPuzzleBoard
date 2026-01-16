using System.Text.Json.Serialization;

namespace AlgoPuzzleBoard.MVC.Models
{
    public class DFSGraphNode
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = "";
        [JsonPropertyName("x")]
        public double X { get; set; }
        [JsonPropertyName("y")]
        public double Y { get; set; }
    }

    public class DFSGraphEdge
    {
        [JsonPropertyName("source")]
        public string Source { get; set; } = "";
        [JsonPropertyName("target")]
        public string Target { get; set; } = "";
    }

    public class DFSGraphData
    {
        [JsonPropertyName("nodes")]
        public List<DFSGraphNode> Nodes { get; set; } = new();
        [JsonPropertyName("edges")]
        public List<DFSGraphEdge> Edges { get; set; } = new();
    }

    public class DFSGraphSolveRequest
    {
        [JsonPropertyName("nodes")]
        public List<DFSGraphNode> Nodes { get; set; } = new();
        [JsonPropertyName("edges")]
        public List<DFSGraphEdge> Edges { get; set; } = new();
        [JsonPropertyName("startNodeId")]
        public string StartNodeId { get; set; } = "";
    }

    public class DFSGraphStep
    {
        [JsonPropertyName("description")]
        public string Description { get; set; } = "";
        [JsonPropertyName("currentNodeId")]
        public string CurrentNodeId { get; set; } = "";
        [JsonPropertyName("parentNodeId")]
        public string ParentNodeId { get; set; } = "";
        [JsonPropertyName("visited")]
        public List<string> Visited { get; set; } = new();
        [JsonPropertyName("stack")]
        public List<string> Stack { get; set; } = new();
        [JsonPropertyName("type")]
        public string Type { get; set; } = ""; // "Visit", "Push", "Pop"
    }

    public class DFSGraphResult
    {
        [JsonPropertyName("steps")]
        public List<DFSGraphStep> Steps { get; set; } = new();
        [JsonPropertyName("traversalOrder")]
        public List<string> TraversalOrder { get; set; } = new();
    }
}
