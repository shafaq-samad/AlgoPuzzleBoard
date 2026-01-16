namespace AlgoPuzzleBoard.MVC.Models
{
    public class City
    {
        public int Id { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
    }

    public class TSPResult
    {
        public List<int> Tour { get; set; } = new();
        public double TotalDistance { get; set; }
    }
}
