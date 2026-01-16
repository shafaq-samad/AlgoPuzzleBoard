using AlgoPuzzleBoard.MVC.Models;
using AlgoPuzzleBoard.MVC.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class BFSController : Controller
    {
        private readonly BFSService _service;

        public BFSController(BFSService service)
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
            if (count < 1) count = 1;
            if (count > 15) count = 15;

            var tree = _service.GenerateRandomBST(count);
            return Json(tree);
        }

        [HttpPost]
        public IActionResult Solve([FromBody] BFSSolveRequest request)
        {
            if (request == null || request.Nodes == null || request.Edges == null)
            {
                return BadRequest("Invalid tree data.");
            }

            var result = _service.SolveBFS(request.Nodes, request.Edges, request.StartNodeId);
            return Json(result);
        }
    }
}
