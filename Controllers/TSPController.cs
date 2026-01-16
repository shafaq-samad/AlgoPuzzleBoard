using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AlgoPuzzleBoard.MVC.Services;
using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class TSPController : Controller
    {
        private readonly TSPService _service;

        public TSPController()
        {
            _service = new TSPService();
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult SolveTSP([FromBody] List<City> cities)
        {
            var result = _service.SolveTSP(cities);
            return Json(result);
        }

        [HttpPost]
        public IActionResult GetNextMove([FromBody] NextMoveRequest request)
        {
            var cities = request.Cities ?? new List<City>();
            var currentPath = request.CurrentPath ?? new List<int>();
            var move = _service.GetNextBestMove(cities, currentPath);
            if (move == null) return NotFound("No valid move");
            return Json(move);
        }

        public class NextMoveRequest 
        {
            public List<City>? Cities { get; set; }
            public List<int>? CurrentPath { get; set; }
        }
    }
}
