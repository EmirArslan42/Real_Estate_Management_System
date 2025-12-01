using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Business.Abstract;
using WebApplication1.Entities;

namespace WebApplication1.Controllers
{
    [Authorize] // sadece login olan kişi listeleme,güncelleme işlemlerini yapabilir
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        public readonly IUserService _userService;

        // UserService dependency injection yapmış olduk
        public UserController(IUserService userService) { 
            _userService = userService; 
        }

        [HttpGet] //GET  api/user
        public IActionResult GetUsers()
        {
            var users=_userService.GetAllUsers();
            return Ok(users);
        }

        [HttpGet("{id}")] //GET  /api/user/1
        public IActionResult GetUserById(int id)
        {
            var user = _userService.GetUserById(id);
            if (user != null)
            {
                return Ok(user);
            }
            return NotFound("User not found"); // kullanıcı yoksa uyarı ver
        }

        [Authorize(Roles ="Admin")] // Sadece admin silebilir
        [HttpDelete("{id}")] // DELETE /api/user/1
        public IActionResult DeleteUser(int id)
        {
            var deletingUser = _userService.GetUserById(id);
            if(deletingUser != null)
            {
                _userService.DeleteUser(id);
                return Ok("Kullanıcı silindi");
            }
            return NotFound("Kullanıcı bulunamadı");
        }

        [HttpPost] // POST /api/user
        public IActionResult AddUser([FromBody] User user)
        {
            _userService.AddUser(user);
            return Ok("Kullanıcı eklendi");
        }

        [HttpPut("{id}")] // PUT /api/user/1
        public IActionResult UpdateUser(int id,[FromBody] User user)
        {
            var updatingUser=_userService.GetUserById(id);
            if(updatingUser!= null)
            {
                user.Id = id;
                _userService.UpdateUser(user);
                return Ok("Kullanıcı güncellendi");
            }
            return NotFound("Kullanıcı bulunamadı");
        }

    }
}
