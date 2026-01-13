using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using WebApplication1.Business.Abstract;
using WebApplication1.DataAccess;
using WebApplication1.Dtos;
using WebApplication1.Entities;

namespace WebApplication1.Business.Concrete
{
    public partial class AuthService: IAuthService 
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration; // appsettings.json dosyasına erişmemizi sağlar

        public AuthService(ApplicationDbContext context,IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration; // appsettings.json'daki jwt:key'i kullanmamızı sağlayacak 
        }
        public async Task<User> RegisterAsync(UserRegisterDto dto)
        {
            // email var mı yok mu kontrol ?
            if(await UserExistsAsync(dto.Email))
            {
                throw new InvalidOperationException("Bu email zaten kayıtlı.");
            }

            if(!IsPasswordValid(dto.Password))
            {
                throw new InvalidOperationException("Şifre en az 8 karakter olmalı, 1 büyük ve 1 küçük harf içermelidir.");
            }

            // şifreyi hashleyip kaydettik
            string passwordHash=CreatePasswordHash(dto.Password);

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = passwordHash,
                Role="User",
            };

            // kullanıcıyı kaydettik
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return user;
        }

        [GeneratedRegex(@"^(?=.*[a-z])(?=.*[A-Z]).{8,}$")]
        private static partial Regex PasswordRegex();
        private static bool IsPasswordValid(string password)
        {
            // En az 1 büyük, 1 küçük harf
            return PasswordRegex().IsMatch(password);
        }

        private static string CreatePasswordHash(string password)
        {
            var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashBytes);
        }

        // şifre doğrulama işlemi yap
        private static bool VerifyPasswordHash(string password, string passwordHash)
        {
            var newHash = CreatePasswordHash(password);
            return newHash == passwordHash;
        }

        // token oluşturma işlemini yaptık
        public string GenerateToken(User user)
        {
            var claims = new List<Claim> // id,email gibi kullanıcı bilgilerini tutuyor
            {
                new Claim("id",user.Id.ToString()),
                new Claim("name", user.Name ?? ""),
                new Claim("email",user.Email),
                new Claim(ClaimTypes.Role,user.Role), 
            };
            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                throw new InvalidOperationException("JWT key configuration is missing.");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)); // appsetting.jsondaki secret key i aldık
            var credentials = new SigningCredentials(key,SecurityAlgorithms.HmacSha256); // token ı imzaladık

            var token = new JwtSecurityToken( // token ı oluşturduk
                claims:claims,
                signingCredentials:credentials,
                expires:DateTime.Now.AddHours(5)
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<User> LoginAsync(UserLoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u=>u.Email==dto.Email) ?? throw new UnauthorizedAccessException("Email veya şifre hatalı");
            
            if (!VerifyPasswordHash(dto.Password,user.PasswordHash)) // şifre doğru mu kontrol et
            {
                throw new UnauthorizedAccessException("Email veya şifre hatalı");
            }
            return user;
        }

        // email var mı yok mu kontrol
        public async Task<bool> UserExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u=>u.Email==email);
        } 
    }
}
