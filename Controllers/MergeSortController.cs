using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoPuzzleBoard.MVC.Services;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class MergeSortController : Controller
    {
        private readonly MergeSortService _mergeSortService;

        public MergeSortController()
        {
            _mergeSortService = new MergeSortService();
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult GenerateSteps([FromBody] SortRequest request)
        {
            if (!_mergeSortService.ValidateInput(request.Array, out string errorMessage))
            {
                return BadRequest(new { error = errorMessage });
            }

            var result = _mergeSortService.GenerateSortingSteps(request.Array, request.IsAscending);
            return Json(result);
        }
    }
}
