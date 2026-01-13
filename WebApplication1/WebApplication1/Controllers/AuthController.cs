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
        private readonly ILogService _logService;
        public AuthController(IAuthService authService,ILogService logService) {

        _authService=authService;
        _logService=logService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
        {
            try
            {
                var newUser = await _authService.RegisterAsync(dto);

                _logService.AddLog(new Log
                {
                    UserId = newUser.Id,
                    OperationType = "Register",
                    Description = $"Yeni kullanıcı kayıt oldu : {newUser.Email}",
                    IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
                });

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
            {
                return BadRequest("Email ve şifre zorunludur.");
            }
            var user =await _authService.LoginAsync(dto);

            if(user== null)
            {
                return Unauthorized("Email veya şifre yanlış");
            }

            if (!user.IsActive)
            {
                return Unauthorized("Kullanıcı pasif durumdadır.");
            }

            var token = _authService.GenerateToken(user);

            _logService.AddLog(new Log
            {
                UserId=user.Id,
                OperationType="Login",
                Description=$"Kullanici giris yapti : {user.Email}",
                IpAddress=HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
            });

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
