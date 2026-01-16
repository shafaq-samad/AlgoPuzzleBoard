using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoPuzzleBoard.MVC.Models;
using AlgoPuzzleBoard.MVC.Services;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class LinearSearchController : Controller
    {
        private readonly LinearSearchService _searchService;

        public LinearSearchController()
        {
            _searchService = new LinearSearchService();
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public IActionResult GenerateSteps([FromBody] SearchRequest request)
        {
            if (!_searchService.ValidateInput(request.Array, out string errorMessage))
            {
                return BadRequest(new { error = errorMessage });
            }

            var result = _searchService.GenerateSearchSteps(request.Array, request.Target);
            return Json(result);
        }
    }
}
