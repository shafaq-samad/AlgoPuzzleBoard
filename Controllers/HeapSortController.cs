using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoPuzzleBoard.MVC.Services;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class HeapSortController : Controller
    {
        private readonly HeapSortService _heapSortService;

        public HeapSortController()
        {
            _heapSortService = new HeapSortService();
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult GenerateSteps([FromBody] SortRequest request)
        {
            if (!_heapSortService.ValidateInput(request.Array, out string errorMessage))
            {
                return BadRequest(new { error = errorMessage });
            }

            var result = _heapSortService.GenerateSortingSteps(request.Array, request.IsAscending);
            return Json(result);
        }
    }
}
