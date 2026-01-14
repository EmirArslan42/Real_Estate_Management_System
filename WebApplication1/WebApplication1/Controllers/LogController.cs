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
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst("id") ?? throw new UnauthorizedAccessException("Kullanıcı kimliği bulunamadı.");    
            return int.Parse(userIdClaim.Value);
        }

        [Authorize(Roles ="Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllLogs()
        {
            var logs= await _logService.GetAllLogsAsync();
            return Ok(logs);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyLogs()
        {
            var userId=GetUserId();
            var logs = await _logService.GetLogsByUserIdAsync(userId);
            return Ok(logs);
        }
    }
} 