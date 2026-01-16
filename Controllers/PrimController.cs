using Microsoft.AspNetCore.Mvc;
using AlgoPuzzleBoard.MVC.Services;
using AlgoPuzzleBoard.MVC.Models;
using Microsoft.AspNetCore.Authorization;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class PrimController : Controller
    {
        private readonly PrimService _service;

        public PrimController(PrimService service)
        {
            _service = service;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Solve([FromBody] PrimSolveRequest request)
        {
            if (request == null || request.Nodes == null || request.Edges == null)
            {
                return BadRequest("Invalid graph data.");
            }

            var result = _service.SolvePrim(request.Nodes, request.Edges, request.StartNodeId);
            return Json(result);
        }

        [HttpGet]
        public IActionResult GenerateRandom(int count = 5)
        {
            if (count < 2) count = 2;
            if (count > 26) count = 26; 
            
            var graph = _service.GenerateRandomGraph(count);
            return Json(graph);
        }
    }
}
