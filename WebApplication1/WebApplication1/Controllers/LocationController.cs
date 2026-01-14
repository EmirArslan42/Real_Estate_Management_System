using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Business.Abstract;

namespace WebApplication1.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LocationController : ControllerBase
    {
        private readonly ILocationService _locationService;
        public LocationController(ILocationService locationService) {
            _locationService = locationService;
        }

        [HttpGet("iller")]
        public async Task<IActionResult> GetIller()
        {
            var iller =await _locationService.GetIllerAsync();
            return Ok(iller);
        }

        [HttpGet("ilceler/{ilId}")]
        public async Task<IActionResult> GetIlceler(int ilId)
        {
            var ilceler=await _locationService.GetIlcelerAsync(ilId);
                return Ok(ilceler);
        }

        [HttpGet("mahalleler/{ilceId}")]
        public async Task<IActionResult> GetMahalleler(int ilceId)
        {
            var mahalleler = await _locationService.GetMahallelerAsync(ilceId);
            return Ok(mahalleler);
        }
    }
} 