using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.IO;
using WebApplication1.Business.Abstract;
using WebApplication1.DataAccess;
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
        private readonly ApplicationDbContext _context;
        public TasinmazController(ITasinmazService service,ILogService logService,ApplicationDbContext context) {
            
            _service = service;
            _logService = logService;  
            _context=context;
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
        public async Task<IActionResult> Add([FromForm] TasinmazDto dto,IFormFile? Image) // [FromForm] olduğundan emin olun
        {
            try
            {
                if (Image != null)
                {
                    using var ms=new MemoryStream();
                    await Image.CopyToAsync(ms);

                    dto.ImageData=ms.ToArray();
                    dto.ImageType = Image.ContentType;

                }

                var userId = GetUserId();

                // ÖNEMLİ: Formdan Coordinate (Geometry) verisi gelmiyorsa 
                // yukarıda Excel için yaptığımız "default" atamayı burada da yapmalısınız!
                if (string.IsNullOrEmpty(dto.Geometry))
                {
                    // Excel'deki gibi default polygon ataması yapın veya hata döndürün
                    return BadRequest("Koordinat bilgisi eksik!");
                }

                var result = await _service.AddAsync(dto, userId);
                return result ? NoContent() : BadRequest("Ekleme başarısız.");
            }
            catch (Exception ex)
            {
                // Hatayı console'a yazdır ki Visual Studio 'Output' penceresinde görebilesin
                Console.WriteLine("HATA: " + ex.Message);
                return StatusCode(500, $"Sunucu hatası: {ex.Message}");
            }
        }


        [Authorize(Roles = "User")]
        [HttpPost("from-excel")]
        [Consumes("application/json")]
        public async Task<IActionResult> AddFromExcel ([FromBody] TasinmazExcelDto dto)
        {

            var userId = GetUserId();
            var result=await _service.AddFromExcelAsync(dto,userId);

            if (!result)
            {
                return BadRequest("Excel satırı eklenemedi");
            }

            _logService.AddLog(new Log
            {
                UserId = userId,
                OperationType = "AddTasinmazFromExcel",
                Description = $"Kullanici yeni tasinmaz ekledi. ParcelNumber: {dto.ParcelNumber}",
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            });
            return NoContent();
        }

        //[AllowAnonymous]
        //[HttpGet("{id}/image")]
        //public async Task<IActionResult> GetImage(int id)
        //{
        //    var tasinmaz = await _context.Tasinmazlar.FirstOrDefaultAsync(t=>t.Id == id);

        //    if (tasinmaz == null || tasinmaz.ImageData == null)
        //        return NotFound();

        //    return File(tasinmaz.ImageData, tasinmaz.ImageType);
        //}

        [AllowAnonymous]
        [HttpGet("{id}/image")]
        public async Task<IActionResult> GetImage(int id)
        {
            var image = await _service.GetImageAsync(id);

            if (image == null)
                return NotFound();

            return File(image.Value.ImageData, image.Value.ImageType);
        }


        [Authorize(Roles = "User")]
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(int id,[FromForm] TasinmazDto dto,IFormFile? Image)
        {
            byte[]? imageData = null;
            string? imageType = null;

            // Yeni resim geldiyse
            if (Image != null && Image.Length > 0)
            {
                using var ms = new MemoryStream();
                await Image.CopyToAsync(ms);

                imageData = ms.ToArray();
                imageType = Image.ContentType;
            }

            var userId =GetUserId() ;
            var result =await _service.UpdateAsync(id,dto,userId, imageData,imageType); // tasinmaz var mı yok mu onu kontrol etmek için

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
