using WebApplication1.Business.Abstract;
using WebApplication1.DataAccess;
using WebApplication1.Entities;

namespace WebApplication1.Business.Concrete
{
    public class UserService:IUserService
    {
        private readonly ApplicationDbContext _context;

        // Constructor - DbContext enjekte ediliyor - her yerde kullanabilirsin
        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }
         
        public void AddUser(User user)
        { 
            _context.Users.Add(user);
            _context.SaveChanges();
        }
        public void DeleteUser(int id)
        {
            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user != null)
            {
                _context.Users.Remove(user);
                _context.SaveChanges();
            }
        }
        public void UpdateUser(User user)
        {
            _context.Users.Update(user);
            _context.SaveChanges(); 
        }
        public List<User> GetAllUsers()
        {
            return _context.Users.ToList();
        }

        public User GetUserById(int id)
        {
            return _context.Users.FirstOrDefault(u => u.Id == id);
        }
    }
}
