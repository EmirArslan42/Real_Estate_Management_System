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

        [HttpGet] 
        public async Task<IActionResult> GetUsers()
        {
            var users=await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("{id}")] 
        public async Task<IActionResult> GetUserById(int id)
        {
            var user =await _userService.GetUserByIdAsync(id);
            return user == null ? NotFound("User not found") : Ok(user);
        }

        [Authorize(Roles ="Admin")] 
        [HttpDelete("{id}")] 
        public async Task<IActionResult> DeleteUser(int id)
        {
            var adminUserId=GetUserId();
            var result = await _userService.DeleteUserAsync(id, adminUserId);
            return result
                ? Ok(new { success = true, message = "Kullanıcı silindi" })
                : NotFound("Kullanıcı bulunamadı");
        }

        [HttpPost] 
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> AddUser([FromBody] UserWriteDto dto)
        {          
            var adminUserId=GetUserId();
            var result=await _userService.AddUserAsync(dto,adminUserId);

            return result 
                ? Ok(new { success = true, message = "Kullanıcı eklendi" }) 
                : BadRequest("Kullanici eklenirken hata olustu");
        }

        [HttpPut("{id}")] 
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> UpdateUser(int id,[FromBody] UserWriteDto dto)
        {          
            var adminUserId=GetUserId();
            var result=await _userService.UpdateUserAsync(id,dto,adminUserId);
           
            return result 
                ? Ok(new{success = true,message = "Kullanıcı güncellendi"})
                : NotFound("Kullanıcı bulunamadı");
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeUserStatus(int id)
        {
            var adminUserId = GetUserId();
            var result = await _userService.ChangeUserStatusAsync(id,adminUserId);

            if (!result)
                return NotFound("Kullanıcı bulunamadı");
           
            return Ok(new
            {
                success = true,
                message = "Kullanıcı durumu güncellendi"
            });
        }
    }
}