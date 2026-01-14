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
        public TasinmazController(ITasinmazService service) {
            
            _service = service;
        }

        // tokendan userId çekme
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst("id");

            if(userIdClaim == null || !int.TryParse(userIdClaim.Value,out var userId))
            {
                throw new UnauthorizedAccessException("Kullanıcı kimliği bulunamadı.");
            }
            return userId;
        }
      
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetUserId();
            var tasinmazListe =await _service.GetAllAsync(userId);
            return Ok(tasinmazListe);
        }

        
        [Authorize(Roles ="Admin")]
        [HttpGet("allForAdmin")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var userId = GetUserId();
            var tasinmazlar =await _service.GetAllForAdminAsync(userId);
            return Ok(tasinmazlar);
        }
        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId=GetUserId();
            var tasinmaz=await _service.GetByIdAsync(id, userId);
               
            return tasinmaz==null ? NotFound("Taşınmaz Bulunamadı") : Ok(tasinmaz);
        }

        [Authorize(Roles ="User")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId= GetUserId();
            var result=await _service.DeleteAsync(id, userId);

            return result ? NoContent() : NotFound();

        }

        [Authorize(Roles = "User")]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Add([FromForm] TasinmazDto dto,IFormFile? Image) // [FromForm] olduğundan emin ol
        {
            if (Image != null)
            {
                using var ms = new MemoryStream();
                await Image.CopyToAsync(ms);

                dto.ImageData = ms.ToArray(); // byte çevirdiğim kısım
                dto.ImageType = Image.ContentType;
            }

            var userId = GetUserId();
            var result = await _service.AddAsync(dto, userId);

            return result ? NoContent() : BadRequest("Ekleme başarısız.");

        }

        [Authorize(Roles = "User")]
        [HttpPost("from-excel")]
        [Consumes("application/json")]
        public async Task<IActionResult> AddFromExcel ([FromBody] TasinmazExcelDto dto)
        {
            var userId = GetUserId();
            var result=await _service.AddFromExcelAsync(dto,userId);
            return result ? NoContent() : BadRequest("Excel satırı eklenemedi");
        }

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

            if (Image != null && Image.Length > 0)
            {
                using var ms = new MemoryStream();
                await Image.CopyToAsync(ms);

                imageData = ms.ToArray();
                imageType = Image.ContentType;
            }

            var userId =GetUserId() ;
            var result =await _service.UpdateAsync(id,dto,userId, imageData,imageType); // tasinmaz var mı yok mu onu kontrol etmek için

            return result ? NoContent() : NotFound("Tasinmaz yok");
        }
    }
}