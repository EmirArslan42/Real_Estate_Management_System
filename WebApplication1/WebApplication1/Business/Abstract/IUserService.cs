using WebApplication1.Dtos;
using WebApplication1.Entities;

namespace WebApplication1.Business.Abstract
{
    public interface IUserService // Admin Paneli → Kullanıcı Yönetimi kısmında kullanacağız
    {
        Task<List<UserDto>> GetAllUsersAsync();
        Task<UserDto> GetUserByIdAsync(int id);
        Task<bool> AddUserAsync(UserWriteDto dto);
        Task<bool> UpdateUserAsync(int id,UserWriteDto dto);
        Task<bool> DeleteUserAsync(int id);

        Task<bool> ChangeUserStatusAsync(int id);
    }
}
  