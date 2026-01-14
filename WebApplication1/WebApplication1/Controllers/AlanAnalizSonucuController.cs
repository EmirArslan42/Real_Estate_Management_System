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
    [Route("api/alan-analizi")]
    [ApiController]
    public class AlanAnalizSonucuController : ControllerBase
    {
        private readonly IAlanAnalizSonucuService _service;

        public AlanAnalizSonucuController(IAlanAnalizSonucuService service)
        {
            _service = service;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst("id") ?? throw new UnauthorizedAccessException("UserId claim bulunamadı");
            return int.Parse(userIdClaim.Value);
        }

        
        [HttpGet("results")] // union sonuçlarını verir
        public async Task<IActionResult> GetUnionResults()
        {
            var userId= GetUserId();
            var results=await _service.GetUnionResultsAsync(userId);
            return Ok(results);
        }

        
        [HttpGet("auto-select")]
        public async Task<IActionResult> AutoSelect()
        {
            var userId = GetUserId();
            var result = await _service.GetABCAsync(userId);

            if (result == null)
                return BadRequest("Kaydedilen geometri bulunamadı. Lütfen manual çizim deneyin");

            return Ok(new
            {
                a=result.Value.A,
                b=result.Value.B,
                c=result.Value.C,
            });
        }
        
        // A / B / C / D / E → SAVE OR UPDATE -  Manuel çizimde A,B,C - Union sonucunda D,E
        [HttpPost("save")]
        public async Task<IActionResult> SaveOrUpdate([FromBody] AlanAnalizSonucuDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Name alanı zorunludur (A,B,C,D,E).");

            var userId = GetUserId();
            await _service.SaveOrUpdateAsync(dto,userId);
            return Ok();
        }
        
        [HttpDelete]
        public async Task<IActionResult> ResetAnaliz()
        {
            var userId = GetUserId();
            await _service.ClearToAllAnaliz(userId);
            return Ok();
        }
    }
}