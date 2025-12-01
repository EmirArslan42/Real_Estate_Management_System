using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Business.Abstract;

namespace WebApplication1.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LogController : ControllerBase
    {
        private readonly ILogService _logService;
        public LogController(ILogService logService) { 
            _logService = logService;
        }

        // token içindeki userId yi çekelim
        private int GetUserId()
        {
            return int.Parse(User.FindFirst("id").Value);
        }

        // tüm kayıtları sadece admin görebilsin
        [Authorize(Roles ="Admin")]
        [HttpGet]
        public IActionResult GetAllLogs()
        {
            var logs=_logService.GetAllLogs();
            return Ok(logs);
        }

        // user sadece kendi loglarını görsün
        [HttpGet("me")]
        public IActionResult GetMyLogs()
        {
            var userId=GetUserId();
            var logs=_logService.GetAllLogs().Where(l=>l.UserId==userId).ToList();
            return Ok(logs);
        }
    }
}
