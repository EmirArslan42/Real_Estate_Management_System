using WebApplication1.Dtos;
using WebApplication1.Entities;

namespace WebApplication1.Business.Abstract
{
    public interface IAuthService
    {
        Task<User> LoginAsync(UserLoginDto dto); // hash doğrulaması yap
        Task<User> RegisterAsync(UserRegisterDto dto); // şifreyi hashsle kullanıcıyı kaydet

        Task<bool> UserExistsAsync(string email); // email var mı kontrol et 
        string GenerateToken(User user); // kullanıcı için jwt token oluştur
    }
}
 