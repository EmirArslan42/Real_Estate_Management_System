using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebApplication1.Business.Abstract;
using WebApplication1.Dtos;
using WebApplication1.Entities;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase 
    { 
        public readonly IAuthService _authService;
        public AuthController(IAuthService authService) {

        _authService=authService;
        } 

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
        {
            try
            {
                var newUser = await _authService.RegisterAsync(dto);
                return Ok(new
                {
                    Message = "Kullanıcı Kayıt İşlemi Başarılı",
                    User = new
                    {
                        newUser.Id,
                        newUser.Name,
                        newUser.Email,
                        newUser.Role,
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("Email ve şifre zorunludur.");

            var user =await _authService.LoginAsync(dto);
            var token = _authService.GenerateToken(user);

            return Ok(new
            {
                Message="Giriş İşlemi Başarılı",
                Token=token,
                User = new
                {
                    user.Id,
                    user.Email,
                    user.Name,
                    user.Role,
                }
            });
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            return Ok(new
            {
                UserId = User.FindFirst("id")?.Value,
                Email = User.FindFirst(ClaimTypes.Email)?.Value,
                Name = User.FindFirst("name")?.Value,
                Role = User.FindFirst(ClaimTypes.Role)?.Value
            });
        }

    }
}