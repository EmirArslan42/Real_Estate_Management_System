using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Business.Abstract;
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
        public IActionResult Register([FromBody] User userDto)
        {
            if (_authService.UserExists(userDto.Email))
            {
                return BadRequest("Bu email zaten kayıtlı");
            }

            string password = userDto.PasswordHash;

            if(string.IsNullOrEmpty(userDto.Role) )
            {
                userDto.Role = "User";
            }

            // register işlemi
            var newUser = _authService.Register(userDto,password);

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
                User=newUser,

            });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest loginDto)
        {
            var user = _authService.Login(loginDto.Email, loginDto.Password);

            if(user== null)
            {
                return Unauthorized("Email veya şifre yanlış");
            }

            _logService.AddLog(new Log
            {
                UserId=user.Id,
                OperationType="Login",
                Description=$"Kullanici giris yapti : {user.Email}",
                IpAddress=HttpContext.Connection.RemoteIpAddress?.ToString(),
            });

            var token=_authService.GenerateToken(user);

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

    public class LoginRequest // Login bodysinde diğer değişkenlere erişmemesi için
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
