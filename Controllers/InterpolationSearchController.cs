using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoPuzzleBoard.MVC.Models;
using AlgoPuzzleBoard.MVC.Services;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class InterpolationSearchController : Controller
    {
        private readonly InterpolationSearchService _searchService;

        public InterpolationSearchController()
        {
            _searchService = new InterpolationSearchService();
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
