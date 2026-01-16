using AlgoPuzzleBoard.MVC.Services;
using Microsoft.AspNetCore.Mvc;

namespace AlgoPuzzleBoard.MVC.Controllers
{
    public class ChatController : Controller
    {
        private readonly ChatService _chatService;

        public ChatController(ChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpPost]
        public IActionResult SendMessage([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest("Message cannot be empty.");

            var response = _chatService.GetResponse(request.Message, request.CurrentContext);
            return Ok(new { response });
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; }
        public string CurrentContext { get; set; }
    }
}
