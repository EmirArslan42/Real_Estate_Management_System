using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.DataAccess;
using WebApplication1.Dtos;
using WebApplication1.Entities;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Business.Abstract;

namespace WebApplication1.Controllers
{
    [Authorize(Roles ="User")]
    [Route("api/[controller]")]
    [ApiController]
    public class AlanAnalizSonucuController : ControllerBase
    {

        private readonly IAlanAnalizSonucuService _service;

        public AlanAnalizSonucuController(IAlanAnalizSonucuService service)
        {
            _service = service;
        }

        // Union sonucunu D veya E olarak kaydetmemizi sağlar
        [HttpPost("union")]
        public async Task<IActionResult> SaveUnionResult([FromBody] AlanAnalizSonucuDto dto)
        {   
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var saved=await _service.SaveUnionResultAsync(dto);
            return Ok(saved);
            
        }

        // union sonuçlarını verir
        [HttpGet("results")]
        public async Task<IActionResult> GetResults()
        {
            var results=await _service.GetResultsAsync();
            return Ok(results);
        }

        [HttpGet("auto-select")]
        public async Task<IActionResult> AutoSelect()
        {
            var result=await _service.AutoSelectAsync();
            if (result == null)
            {
                return BadRequest("Kaydedilen geometri bulunamadı. Lütfen manual çizim deneyin");
            }

            return Ok(result);
        }

    }
}
