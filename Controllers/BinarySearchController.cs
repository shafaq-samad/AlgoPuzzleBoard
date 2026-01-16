using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AlgoPuzzleBoard.MVC.Models;
using AlgoPuzzleBoard.MVC.Services;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class BinarySearchController : Controller
    {
        private readonly BinarySearchService _searchService;

        public BinarySearchController()
        {
            _searchService = new BinarySearchService();
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

            // Pass raw array to service to handle sorting visualization if needed
            var result = _searchService.GenerateSearchSteps(request.Array, request.Target);
            return Json(result);
        }
    }
}
