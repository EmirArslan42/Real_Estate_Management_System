using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using WebApplication1.Business.Abstract;
using WebApplication1.DataAccess;
using WebApplication1.Entities;

namespace WebApplication1.Business.Concrete
{
    public class AuthService:IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration; // appsettings.json dosyasına erişmemizi sağlar

        public AuthService(ApplicationDbContext context,IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration; // appsettings.json'daki jwt:key'i kullanmamızı sağlayacak
        }
        public User Register(User user, string password)
        {
            // şifreyi hashleyip kaydettik
            string passwordHash=createPasswordHash(password);
            user.PasswordHash = passwordHash;

            // kullanıcıyı kaydettik
            _context.Users.Add(user);
            _context.SaveChanges();

            return user;
        }

        private string createPasswordHash(string password)
        {
            using var sha = SHA256.Create();
            var hashBytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashBytes);
        }

        // şifre doğrulama işlemi yap
        private bool VerifyPasswordHash(string password, string passwordHash)
        {
            var newHash = createPasswordHash(password);
            return newHash == passwordHash;
        }

        // token oluşturma işlemini yaptık
        public string GenerateToken(User user)
        {
            List<Claim> claims = new List<Claim>() // id,email gibi kullanıcı bilgilerini tutuyor
            {
                new Claim("id",user.Id.ToString()),
                new Claim("email",user.Email.ToString()),
                new Claim(ClaimTypes.Role,user.Role),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])); // appsetting.jsondaki secret key i aldık
            var credentials = new SigningCredentials(key,SecurityAlgorithms.HmacSha256); // token ı imzaladık

            var token = new JwtSecurityToken( // token ı oluşturduk
                claims:claims,
                signingCredentials:credentials,
                expires:DateTime.Now.AddHours(5)
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public User Login(string email, string password)
        {
            var user = _context.Users.FirstOrDefault(u=>u.Email==email);
            if (user == null){
                return null;
            }
            if (!VerifyPasswordHash(password,user.PasswordHash)) // şifre doğru mu kontrol et
            {
                return null;
            }
            return user;
        }

        // email var mı yok mu kontrol
        public bool UserExists(string email)
        {
            return _context.Users.Any(u=>u.Email==email);
        }
    }
}
