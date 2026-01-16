using AlgoPuzzleBoard.MVC.Models;
using AlgoPuzzleBoard.MVC.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class DFSGraphController : Controller
    {
        private readonly DFSGraphService _service;

        public DFSGraphController(DFSGraphService service)
        {
            _service = service;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult GenerateRandom(int count = 8)
        {
            var graph = _service.GenerateRandomGraph(count);
            return Json(graph);
        }

        [HttpPost]
        public IActionResult Solve([FromBody] DFSGraphSolveRequest request)
        {
            var result = _service.SolveDFS(request.Nodes, request.Edges, request.StartNodeId);
            return Json(result);
        }
    }
}
