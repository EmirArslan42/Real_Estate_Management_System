using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NetTopologySuite.IO;
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

        // tokendan userId çekme
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

        [Authorize(Roles ="Admin")]
        [HttpGet("allForAdmin")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var tasinmazlar =await _service.GetAllForAdminAsync();

            _logService.AddLog(new Log
            {
                UserId = GetUserId(),
                OperationType = "AdminGetAllTasinmaz",
                Description = "Admin tum kullanicilarin tasinmazlarini goruntuledi",
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            });

            return Ok(tasinmazlar);
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

            var writer=new GeoJsonWriter();

            var dto = new TasinmazDto
            {
                MahalleId = tasinmaz.MahalleId,
                LotNumber = tasinmaz.LotNumber,
                Address = tasinmaz.Address,
                ParcelNumber = tasinmaz.ParcelNumber,
                Geometry = writer.Write(tasinmaz.Coordinate)
            };

            _logService.AddLog(new Log
            {
                UserId = userId,
                OperationType="GetTasinmazById",
                Description=$"Kullanici ID: {id} olan tasinmazini goruntuledi",
                IpAddress=HttpContext.Connection.RemoteIpAddress?.ToString(),
            });

            return Ok(dto);
        }

        [Authorize(Roles ="User")]
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

            //return Ok("Tasinmaz basariyla silindi");
            return NoContent(); // veya return Ok();
        }

        [Authorize(Roles = "User")]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Add([FromForm] TasinmazDto dto)
        {
            string? imagePath = null;
            if (dto.Image!=null)
            {
                var fileName = Guid.NewGuid() + Path.GetExtension(dto.Image.FileName);
                var path = Path.Combine("wwwroot/images", fileName);

                using var stream = new FileStream(path, FileMode.Create);
                await dto.Image.CopyToAsync(stream);

                imagePath = "/images/" + fileName;
            }

            var userId = GetUserId();
            var result = await _service.AddAsync(dto,userId,imagePath);

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
            //return Ok("Tasinmaz basariyla eklendi");
            return NoContent();
        }

        [Authorize(Roles = "User")]
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
            //return Ok("Tasinmaz guncellendi");
            return NoContent();
        }
    }
}
