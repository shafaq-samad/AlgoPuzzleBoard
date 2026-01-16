using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace AlgoPuzzleBoard.MVC.Models
{
    public class HeapStep
    {
        [JsonPropertyName("description")]
        public string Description { get; set; } = "";
        [JsonPropertyName("array")]
        public List<int> Array { get; set; } = new();
        [JsonPropertyName("highlightIndices")]
        public List<int> HighlightIndices { get; set; } = new();
        [JsonPropertyName("swapIndices")]
        public List<int>? SwapIndices { get; set; }
        [JsonPropertyName("type")]
        public string Type { get; set; } = ""; // "Compare", "Swap", "Complete"
    }

    public class HeapResult
    {
        [JsonPropertyName("steps")]
        public List<HeapStep> Steps { get; set; } = new();
        [JsonPropertyName("finalHeap")]
        public List<int> FinalHeap { get; set; } = new();
    }

    public class HeapSolveRequest
    {
        [JsonPropertyName("array")]
        public List<int> Array { get; set; } = new();
    }
}
