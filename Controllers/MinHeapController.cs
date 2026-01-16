using AlgoPuzzleBoard.MVC.Models;
using AlgoPuzzleBoard.MVC.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System;
using System.Linq;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    [Authorize]
    public class MinHeapController : Controller
    {
        private readonly HeapService _service;

        public MinHeapController(HeapService service)
        {
            _service = service;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult GenerateRandom(int count = 10)
        {
            var rand = new Random();
            var array = Enumerable.Range(1, 99).OrderBy(x => rand.Next()).Take(count).ToList();
            return Json(array);
        }

        [HttpPost]
        public IActionResult Solve([FromBody] HeapSolveRequest request)
        {
            if (request == null || request.Array == null || request.Array.Count == 0)
                return BadRequest("Invalid array data.");

            var result = _service.BuildMinHeap(request.Array);
            return Json(result);
        }
    }
}
