using WebApplication1.Dtos;
using WebApplication1.Entities;

namespace WebApplication1.Business.Abstract
{
    public interface ITasinmazService
    {
        Task<bool> AddAsync(TasinmazDto dto,int userId,string? imagePath);
        Task<bool> AddFromExcelAsync(TasinmazExcelDto dto, int userId);

        Task<bool> UpdateAsync(int id,TasinmazDto dto, int userId, string? imagePath);
        Task<bool> DeleteAsync(int id, int userId);
        Task<Tasinmaz> GetByIdAsync(int id,int userId); // Bir adet taşınmaz 
        Task<List<TasinmazListDto>> GetAllAsync(int userId); // bir kullanıcının tüm taşınmazları
        Task<List<TasinmazListDto>> GetAllForAdminAsync();
    }
}
