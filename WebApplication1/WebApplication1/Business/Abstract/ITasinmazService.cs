using WebApplication1.Dtos;
using WebApplication1.Entities;

namespace WebApplication1.Business.Abstract
{
    public interface ITasinmazService
    {
        Task<bool> AddAsync(TasinmazDto dto,int userId);
        Task<bool> UpdateAsync(int id,TasinmazDto dto, int userId);
        Task<bool> DeleteAsync(int id, int userId);
        Task<Tasinmaz> GetByIdAsync(int id,int userId); // Bir adet taşınmaz 
        Task<List<Tasinmaz>> GetAllAsync(int userId); // bir kullanıcının tüm taşınmazları
    }
}
