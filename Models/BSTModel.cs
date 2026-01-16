using System.Text.Json.Serialization;

namespace AlgoPuzzleBoard.MVC.Models
{
    public class BSTNode
    {
        [JsonPropertyName("value")]
        public int Value { get; set; }
        [JsonPropertyName("left")]
        public BSTNode? Left { get; set; }
        [JsonPropertyName("right")]
        public BSTNode? Right { get; set; }
        [JsonPropertyName("x")]
        public double X { get; set; }
        [JsonPropertyName("y")]
        public double Y { get; set; }
    }

    public class BSTStep
    {
        [JsonPropertyName("description")]
        public string Description { get; set; } = "";
        [JsonPropertyName("nodes")]
        public List<BSTNodeData> Nodes { get; set; } = new();
        [JsonPropertyName("edges")]
        public List<BSTEdgeData> Edges { get; set; } = new();
        [JsonPropertyName("highlightValue")]
        public int? HighlightValue { get; set; }
        [JsonPropertyName("compareValue")]
        public int? CompareValue { get; set; }
        [JsonPropertyName("type")]
        public string Type { get; set; } = ""; // "Insert", "Compare", "Complete"
    }

    public class BSTNodeData
    {
        [JsonPropertyName("value")]
        public int Value { get; set; }
        [JsonPropertyName("id")]
        public string Id { get; set; } = "";
        [JsonPropertyName("x")]
        public double X { get; set; }
        [JsonPropertyName("y")]
        public double Y { get; set; }
    }

    public class BSTEdgeData
    {
        [JsonPropertyName("from")]
        public string From { get; set; } = "";
        [JsonPropertyName("to")]
        public string To { get; set; } = "";
    }

    public class BSTResult
    {
        [JsonPropertyName("steps")]
        public List<BSTStep> Steps { get; set; } = new();
    }

    public class BSTSolveRequest
    {
        [JsonPropertyName("array")]
        public List<int> Array { get; set; } = new();
    }
}
