using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Business.Abstract;
using WebApplication1.Dtos;

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

            var dtoList = logs.Select(l => new LogDto
            {
                Id = l.Id,
                UserId = l.UserId,
                OperationType = l.OperationType,
                Description = l.Description,
                IpAddress = l.IpAddress,
                Timestamp = l.Timestamp,

            }).ToList();
            return Ok(dtoList);
        }

        // user sadece kendi loglarını görsün
        [HttpGet("me")]
        public IActionResult GetMyLogs()
        {
            var userId=GetUserId();
            var logs=_logService.GetAllLogs().Where(l=>l.UserId==userId).ToList();

            var dtoList = logs.Select(l=>new LogDto
            {
                Id = l.Id,
                UserId = l.UserId,
                OperationType = l.OperationType,
                Description = l.Description,
                IpAddress = l.IpAddress,
                Timestamp = l.Timestamp
            });
            return Ok(dtoList);
        }
    }
}