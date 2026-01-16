namespace AlgoPuzzleBoard.MVC.Models
{
    public class Graph
    {
        public List<Node> Nodes { get; set; } = new();
        public List<Edge> Edges { get; set; } = new();
    }

    public class Node
    {
        public int Id { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
        public int ColorIndex { get; set; } = -1; // -1 = uncolored
    }

    public class Edge
    {
        public int Source { get; set; }
        public int Target { get; set; }
    }
}
