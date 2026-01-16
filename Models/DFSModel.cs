using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace AlgoPuzzleBoard.MVC.Models
{
    public class DFSNode
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = "";
        [JsonPropertyName("value")]
        public int Value { get; set; }
        [JsonPropertyName("x")]
        public double X { get; set; }
        [JsonPropertyName("y")]
        public double Y { get; set; }
    }

    public class DFSEdge
    {
        [JsonPropertyName("source")]
        public string Source { get; set; } = "";
        [JsonPropertyName("target")]
        public string Target { get; set; } = "";
    }

    public class DFSTree
    {
        [JsonPropertyName("nodes")]
        public List<DFSNode> Nodes { get; set; } = new();
        [JsonPropertyName("edges")]
        public List<DFSEdge> Edges { get; set; } = new();
    }

    public class DFSSolveRequest
    {
        [JsonPropertyName("nodes")]
        public List<DFSNode> Nodes { get; set; } = new();
        [JsonPropertyName("edges")]
        public List<DFSEdge> Edges { get; set; } = new();
        [JsonPropertyName("startNodeId")]
        public string StartNodeId { get; set; } = "";
        [JsonPropertyName("traversalType")]
        public string TraversalType { get; set; } = "PreOrder"; 
    }

    public class DFSStep
    {
        [JsonPropertyName("description")]
        public string Description { get; set; } = "";
        [JsonPropertyName("currentNodeId")]
        public string CurrentNodeId { get; set; } = "";
        [JsonPropertyName("visited")]
        public List<string> Visited { get; set; } = new();
        [JsonPropertyName("type")]
        public string Type { get; set; } = "";
    }

    public class DFSResult
    {
        [JsonPropertyName("steps")]
        public List<DFSStep> Steps { get; set; } = new();
        [JsonPropertyName("traversalOrder")]
        public List<string> TraversalOrder { get; set; } = new();
    }
}
