using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoPuzzleBoard.MVC.Services;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class RadixSortController : Controller
    {
        private readonly RadixSortService _radixSortService;

        public RadixSortController()
        {
            _radixSortService = new RadixSortService();
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult GenerateSteps([FromBody] SortRequest request)
        {
            if (!_radixSortService.ValidateInput(request.Array, out string errorMessage))
            {
                return BadRequest(new { error = errorMessage });
            }

            var result = _radixSortService.GenerateSortingSteps(request.Array, request.IsAscending);
            return Json(result);
        }
    }
}
