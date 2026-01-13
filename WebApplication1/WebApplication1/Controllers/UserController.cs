using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Business.Abstract;
using WebApplication1.Dtos;
using WebApplication1.Entities;

namespace WebApplication1.Controllers
{
    [Authorize] // sadece login olan kişi listeleme,güncelleme işlemlerini yapabilir
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogService _logService;

        // UserService dependency injection yapmış olduk
        public UserController(IUserService userService,ILogService logService) { 
            _userService = userService;  
            _logService = logService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst("id");

            if(userIdClaim == null || !int.TryParse(userIdClaim.Value,out var userId))
            {
                throw new UnauthorizedAccessException("Geçersiz kullanıcı kimliği.");
            }
            return userId;
        }

        [HttpGet] //GET  api/user
        public async Task<IActionResult> GetUsers()
        {
            var users=await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("{id}")] //GET  /api/user/1
        public async Task<IActionResult> GetUserById(int id)
        {
            var user =await _userService.GetUserByIdAsync(id);
            if (user != null)
            {
                return Ok(user);
            }
            return NotFound("User not found"); // kullanıcı yoksa uyarı ver
        }

        [Authorize(Roles ="Admin")] // Sadece admin silebilir
        [HttpDelete("{id}")] // DELETE /api/user/1
        public async Task<IActionResult> DeleteUser(int id)
        {
            var deletingUser =await _userService.GetUserByIdAsync(id);
            if(deletingUser != null)
            {
                await _userService.DeleteUserAsync(id);
                _logService.AddLog(new Log
                {
                    UserId = GetUserId(),
                    OperationType="DeleteUser",
                    Description=$"{id} ID'li kullanici silindi",
                    IpAddress=HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
                });
                return Ok(new
                {
                    success = true,
                    message = "Kullanıcı silindi"
                });
            }
            return NotFound("Kullanıcı bulunamadı");
        }
        [Authorize(Roles ="Admin")]
        [HttpPost] // POST /api/user
        public async Task<IActionResult> AddUser([FromBody] UserWriteDto dto)
        {
            if (string.IsNullOrEmpty(dto.Password))
            {
                return BadRequest("Kullanici olusturmak icin sifre zorunludur");
            }
            var result=await _userService.AddUserAsync(dto);
            if (!result)
            {
                return BadRequest("Kullanici eklenirken hata olustu");
            }
            _logService.AddLog(new Log
            {
                UserId=GetUserId(),
                OperationType="AddUser",
                Description=$"Yeni kullanici eklendi: {dto.Email}",
                IpAddress=HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
            });
            return Ok(new
            {
                success = true,
                message = "Kullanıcı eklendi"
            });
        }

        [Authorize(Roles ="Admin")]
        [HttpPut("{id}")] // PUT /api/user/1
        public async Task<IActionResult> UpdateUser(int id,[FromBody] UserWriteDto dto)
        {
            var updatingUser=await _userService.GetUserByIdAsync(id);
            if(updatingUser!= null)
            {
                await _userService.UpdateUserAsync(id,dto);

                _logService.AddLog(new Log
                {   
                    UserId=GetUserId(),
                    OperationType="UpdateUser",
                    Description=$"{id} ID'li kullanici guncellendi",
                    IpAddress=HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
                });

                return Ok(new
                {
                    success = true,
                    message = "Kullanıcı güncellendi"
                });
            }
            return NotFound("Kullanıcı bulunamadı");
        }


        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeUserStatus(int id)
        {
            var result = await _userService.ChangeUserStatusAsync(id);
            if (!result)
                return NotFound("Kullanıcı bulunamadı");

            _logService.AddLog(new Log
            {
                UserId = GetUserId(),
                OperationType = "ChangeUserStatus",
                Description = $"{id} ID'li kullanıcının aktiflik durumu değiştirildi",
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
            });

            return Ok(new
            {
                success = true,
                message = "Kullanıcı durumu güncellendi"
            });
        }

    }
}
