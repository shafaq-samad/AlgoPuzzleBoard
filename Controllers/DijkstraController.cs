using Microsoft.AspNetCore.Mvc;
using AlgoPuzzleBoard.MVC.Services;
using AlgoPuzzleBoard.MVC.Models;

using Microsoft.AspNetCore.Authorization;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class DijkstraController : Controller
    {
        private readonly DijkstraService _service;

        public DijkstraController()
        {
            _service = new DijkstraService();
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Solve([FromBody] DijkstraSolveRequest request)
        {
            if (request == null || request.Nodes == null || request.Edges == null)
            {
                return BadRequest("Invalid graph data.");
            }

            var result = _service.SolveDijkstra(request.Nodes, request.Edges, request.StartNodeId, request.TargetNodeId);
            return Json(result);
        }

        [HttpPost]
        public IActionResult GetHint([FromBody] DijkstraSolveRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.StartNodeId) || string.IsNullOrEmpty(request.TargetNodeId))
            {
                return BadRequest("Invalid request for hint.");
            }

            var nextMove = _service.GetNextMove(request.Nodes, request.Edges, request.StartNodeId, request.TargetNodeId);
            if (nextMove != null)
            {
                return Json(nextMove);
            }
            return NotFound("No move available.");
        }

        [HttpGet]
        public IActionResult GenerateRandom(int count = 5)
        {
            if (count < 2) count = 2;
            if (count > 20) count = 20; // Cap at 20 for UI sanity

            var graph = _service.GenerateRandomGraph(count);
            return Json(graph);
        }
    }
}
