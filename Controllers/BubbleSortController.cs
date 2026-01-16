using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoPuzzleBoard.MVC.Services;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class BubbleSortController : Controller
    {
        private readonly BubbleSortService _bubbleSortService;

        public BubbleSortController()
        {
            _bubbleSortService = new BubbleSortService();
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult GenerateSteps([FromBody] SortRequest request)
        {
            if (!_bubbleSortService.ValidateInput(request.Array, out string errorMessage))
            {
                return BadRequest(new { error = errorMessage });
            }

            var result = _bubbleSortService.GenerateSortingSteps(request.Array, request.IsAscending);
            return Json(result);
        }
    }

    public class SortRequest
    {
        public int[] Array { get; set; } = new int[0];
        public bool IsAscending { get; set; } = true;
    }
}
