using AlgoPuzzleBoard.MVC.Models;
using AlgoPuzzleBoard.MVC.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class BSTController : Controller
    {
        private readonly BSTService _service;

        public BSTController(BSTService service)
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
            var rand = new Random();
            var array = Enumerable.Range(1, 99).OrderBy(x => rand.Next()).Take(count).ToList();
            return Json(array);
        }

        [HttpPost]
        public IActionResult Solve([FromBody] BSTSolveRequest request)
        {
            if (request == null || request.Array == null || request.Array.Count == 0)
                return BadRequest("Invalid data");

            var result = _service.SolveBST(request.Array);
            return Json(result);
        }
    }
}
