using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
            if (await _authService.UserExistsAsync(dto.Email))
            {
                return BadRequest("Bu email zaten kayıtlı");
            }

            // register işlemi
            var newUser =await _authService.RegisterAsync(dto);

            if (newUser == null)
            {
                return BadRequest("Kayit islemi sirasinda hata olustu");
            }

            // log ekleme işlemini yapacağız
            _logService.AddLog(new Log
            {
                UserId = newUser.Id,
                OperationType="Register",
                Description=$"Yeni kullanıcı kayıt oldu : {newUser.Email}",
                IpAddress=HttpContext.Connection.RemoteIpAddress?.ToString(),
            });

            return Ok(new 
            {
                Message="Kullanıcı Kayıt İşlemi Başarılı",
                User = new
                {
                    newUser.Id,
                    newUser.Name,
                    newUser.Email,
                    newUser.Role,
                },

            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            var user =await _authService.LoginAsync(dto);

            if(user== null)
            {
                return Unauthorized("Email veya şifre yanlış");
            }

            var token = _authService.GenerateToken(user);

            _logService.AddLog(new Log
            {
                UserId=user.Id,
                OperationType="Login",
                Description=$"Kullanici giris yapti : {user.Email}",
                IpAddress=HttpContext.Connection.RemoteIpAddress?.ToString(),
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
    }
}
