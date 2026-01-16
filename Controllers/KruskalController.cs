using Microsoft.AspNetCore.Mvc;
using AlgoPuzzleBoard.MVC.Services;
using AlgoPuzzleBoard.MVC.Models;
using Microsoft.AspNetCore.Authorization;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class KruskalController : Controller
    {
        private readonly KruskalService _service;

        public KruskalController(KruskalService service)
        {
            _service = service;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Solve([FromBody] KruskalSolveRequest request)
        {
            if (request == null || request.Nodes == null || request.Edges == null)
            {
                return BadRequest("Invalid graph data.");
            }

            var result = _service.SolveKruskal(request.Nodes, request.Edges);
            return Json(result);
        }

        [HttpGet]
        public IActionResult GenerateRandom(int count = 5)
        {
            if (count < 2) count = 2;
            if (count > 26) count = 26; // Limit to 26 for A-Z
            
            var graph = _service.GenerateRandomGraph(count);
            return Json(graph);
        }
    }
}
