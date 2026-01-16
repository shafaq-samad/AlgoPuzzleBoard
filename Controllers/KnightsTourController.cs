using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AlgoPuzzleBoard.MVC.Services;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    //Handles Used to handle HTTP requests(Browsers and server used to talk to each other)
    [Authorize]
    public class KnightsTourController : Controller
    {
      
        private readonly KnightsTourService _service;

        public KnightsTourController()
        {
            _service = new KnightsTourService();
        }

        //Opens the main Knight’s Tour page Usually loads UI (chessboard)
        public IActionResult Index()
        {
            return View();
        }

        //Receives starting row and column from client
        //Calls service to solve full Knight’s Tour
        //Returns complete path as JSON
        //When the user clicks solve tour
        [HttpPost]
        public IActionResult SolveTour([FromBody] TourRequest request)
        {
            var path = _service.SolveKnightTour(request.StartRow, request.StartCol);
            return Json(path);
        }

        //This is a DTO (Data Transfer Object)
        //Used to receive data from frontend
        public class TourRequest
        {
            public int StartRow { get; set; }
            public int StartCol { get; set; }
        }


        //Calculates only the next move, not full tour
        //Useful for step-by-step animation
        [HttpPost]
        public IActionResult GetNextMove([FromBody] MoveRequest request)
        {
            // Reconstruct 2D array from flat if needed, or pass simple board representation

           
            // Actually, for Warnsdorff we need to know visited squares.
            // Let's expect the board state from client.
            
            // Simplifying: Assume client sends current 64-element array and dimensions

            
            int[,] board = new int[8, 8];
            for(int i=0; i<8; i++)
                for(int j=0; j<8; j++)
                    board[i, j] = request.Board?[i * 8 + j] ?? 0;

            var move = _service.GetNextMove(board, request.CurrentRow, request.CurrentCol);
            
            if (move == null) return NotFound("No valid move");
            return Json(new { row = move[0], col = move[1] });
        }

        //Current board state
        //Knight’s current position

        public class MoveRequest
        {
            public int[]? Board { get; set; } // Flattened 8x8
            public int CurrentRow { get; set; }
            public int CurrentCol { get; set; }
        }
    }
}
