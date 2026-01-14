using WebApplication1.Dtos;

namespace WebApplication1.Business.Abstract
{
    public interface ILocationService
    {
        Task<List<IlDto>> GetIllerAsync();
        Task<List<IlceDto>> GetIlcelerAsync(int ilId);
        Task<List<MahalleDto>> GetMahallelerAsync(int ilceId);
    }
}