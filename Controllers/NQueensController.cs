using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AlgoPuzzleBoard.MVC.Services;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class NQueensController : Controller
    {
        private readonly NQueensService _service;

        public NQueensController()
        {
            _service = new NQueensService();
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Solve([FromBody] int n = 8)
        {
            var steps = _service.SolveWithSteps(n);
            return Json(steps);
        }

        [HttpPost]
        public IActionResult GetNextMove([FromBody] int[] currentBoard)
        {
            var move = _service.GetNextSafeMove(currentBoard);
            if (move == null) return NotFound("No valid move found or board full");
            return Json(move);
        }
    }
}
