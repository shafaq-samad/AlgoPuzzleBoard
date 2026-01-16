using AlgoPuzzleBoard.MVC.Models;
using AlgoPuzzleBoard.MVC.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class DFSController : Controller
    {
        private readonly DFSService _service;

        public DFSController(DFSService service)
        {
            _service = service;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult GenerateRandom(int count = 7)
        {
            var tree = _service.GenerateRandomBST(count);
            return Json(tree);
        }

        [HttpPost]
        public IActionResult Solve([FromBody] DFSSolveRequest request)
        {
            var result = _service.SolveDFS(request.Nodes, request.Edges, request.StartNodeId, request.TraversalType);
            return Json(result);
        }
    }
}
