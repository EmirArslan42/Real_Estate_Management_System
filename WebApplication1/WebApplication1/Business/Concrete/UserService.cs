using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using WebApplication1.Business.Abstract;
using WebApplication1.DataAccess;
using WebApplication1.Dtos;
using WebApplication1.Entities;

namespace WebApplication1.Business.Concrete
{
    public class UserService:IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogService _logService;

        public UserService(ApplicationDbContext context, ILogService logService)
        {
            _context = context;
            _logService = logService;
        }
        private static string HashPassword(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
        public async Task<bool> AddUserAsync(UserWriteDto dto, int adminUserId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Password))
                    throw new InvalidOperationException("Şifre alanı zorunludur");
                
                var user = new User
                {
                    Name = dto.Name,
                    Email = dto.Email,
                    Role = dto.Role,
                    PasswordHash=HashPassword(dto.Password),
                };
                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

               await _logService.AddLogAsync(new Log
                {
                    UserId = adminUserId,
                    OperationType = "AddUser",
                    Description = $"Yeni kullanici eklendi: {dto.Email}",
                });

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
        public async Task<bool> DeleteUserAsync(int id, int adminUserId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if(user==null)
            {
                return false;
            }
            var logs = _context.Logs.Where(l => l.UserId == id);
            _context.Logs.RemoveRange(logs);
            try
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

               await _logService.AddLogAsync(new Log
                {
                    UserId = adminUserId,
                    OperationType = "DeleteUser",
                    Description = $"{id} ID'li kullanici silindi",
                });

                return true;
            }catch (Exception)
            {
                return false;
            }
        }
       
        public async Task<bool> UpdateUserAsync(int id,UserWriteDto dto, int adminUserId)
        {

            var user = await _context.Users.FirstOrDefaultAsync(u=>u.Id==id);
            if (user == null)
                return false;
            
            user.Name=dto.Name;
            user.Email=dto.Email;
            user.Role=dto.Role;

            if (!string.IsNullOrEmpty(dto.Password))
                user.PasswordHash=HashPassword(dto.Password);
            
            try
            {
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

               await _logService.AddLogAsync(new Log
                {
                    UserId = adminUserId,
                    OperationType = "UpdateUser",
                    Description = $"{id} ID'li kullanici guncellendi",
                });

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
      
        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            return await _context.Users.Select(u => new UserDto {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role=u.Role,
                IsActive=u.IsActive,
            }).ToListAsync();
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u=>u.Id==id);
            if (user == null)
            {
                return null;
            }
            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                IsActive= user.IsActive,
            };
        }

        public async Task<bool> ChangeUserStatusAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return false;

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();

            return true;
        }

    }
}