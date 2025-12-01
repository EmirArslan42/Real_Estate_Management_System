using WebApplication1.Entities;

namespace WebApplication1.Business.Abstract
{
    public interface IUserService // Admin Paneli → Kullanıcı Yönetimi kısmında kullanacağız
    {
        void AddUser(User user);
        void DeleteUser(int id);
        void UpdateUser(User user);
        List<User> GetAllUsers();
        User GetUserById(int id); 
    }
}
