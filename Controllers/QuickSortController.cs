using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoPuzzleBoard.MVC.Services;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class QuickSortController : Controller
    {
        private readonly QuickSortService _quickSortService;

        public QuickSortController()
        {
            _quickSortService = new QuickSortService();
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult GenerateSteps([FromBody] SortRequest request)
        {
            if (!_quickSortService.ValidateInput(request.Array, out string errorMessage))
            {
                return BadRequest(new { error = errorMessage });
            }

            var result = _quickSortService.GenerateSortingSteps(request.Array, request.IsAscending);
            return Json(result);
        }
    }
}
