using WebApplication1.Entities;

namespace WebApplication1.Business.Abstract
{
    public interface IAuthService
    {
        User Login(string email,string password); // hash doğrulaması yap
        User Register(User user,string password); // şifreyi hashsle kullanıcıyı kayde

        bool UserExists(string email); // email var mı kontrol et
        string GenerateToken(User user); // kullanıcı için jwt token oluştur
    }
}
