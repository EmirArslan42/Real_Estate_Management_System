using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Business.Abstract;
using WebApplication1.Dtos;
using WebApplication1.Entities;

namespace WebApplication1.Controllers
{
    [Authorize] // tüm endpointler token istesin 
    [Route("api/[controller]")]
    [ApiController]
    public class TasinmazController : ControllerBase
    {
        private readonly ITasinmazService _service;
        private readonly ILogService _logService;
        public TasinmazController(ITasinmazService service,ILogService logService) {
            
            _service = service;
            _logService = logService;
        }

        // tokendan userId çekme işlemi
        private int GetUserId()
        {
            return int.Parse(User.FindFirst("id").Value);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetUserId();
            var tasinmazListe =await _service.GetAllAsync(userId);

            _logService.AddLog(new Log
            {
                UserId = userId,
                OperationType = "GetAllTasinmaz",
                Description = $"Kullanici tüm tasinmazlarini listeledi.Tasinmaz count {tasinmazListe.Count}",
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            });

            return Ok(tasinmazListe);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId=GetUserId();
            var tasinmaz=await _service.GetByIdAsync(id, userId);

            if(tasinmaz == null)
            {
                return NotFound("Tasinmaz bulunamadı");
            }

            _logService.AddLog(new Log
            {
                UserId = userId,
                OperationType="GetTasinmazById",
                Description=$"Kullanici ID: {id} olan tasinmazini goruntuledi",
                IpAddress=HttpContext.Connection.RemoteIpAddress?.ToString(),
            });

            return Ok(tasinmaz);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId= GetUserId();
            var result=await _service.DeleteAsync(id, userId);

            if (!result)
            {
                return NotFound("Tasinmaz bulunamadi");
            }

            _logService.AddLog(new Log
            {
                UserId = userId,
                OperationType="DeleteTasinmaz",
                Description=$"Kullanici ID:{id} olan tasinmazi sildi.",
                IpAddress=HttpContext.Connection.RemoteIpAddress?.ToString(),
            });

            return Ok("Tasinmaz basariyla silindi");
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] TasinmazDto dto)
        {
            var userId = GetUserId();
            var result = await _service.AddAsync(dto,userId);

            if (!result)
            {
                return BadRequest("Tasinmaz eklenemedi");
            }

            _logService.AddLog(new Log {
                UserId=userId,
                OperationType="AddTasinmaz",
                Description=$"Kullanici yeni tasinmaz ekledi. ParcelNumber: {dto.ParcelNumber}",
                IpAddress=HttpContext.Connection.RemoteIpAddress?.ToString(),
            });
            return Ok("Tasinmaz basariyla eklendi");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id,[FromBody] TasinmazDto dto)
        {
            var userId=GetUserId() ;
            var result =await _service.UpdateAsync(id,dto,userId); // tasinmaz var mı yok mu onu kontrol etmek için

            if(!result) {
                return NotFound("Tasinmaz yok");
            }

            _logService.AddLog(new Log {
                UserId=userId,
                OperationType="UpdateTasinmaz",
                Description=$"Kullanici ID: {id} tasinmazi guncelledi",
                IpAddress=HttpContext.Connection.RemoteIpAddress?.ToString(),
            });
            return Ok("Tasinmaz guncellendi");
        }
    }
}
