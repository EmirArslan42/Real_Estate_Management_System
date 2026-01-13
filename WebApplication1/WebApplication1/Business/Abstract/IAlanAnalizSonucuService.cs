using WebApplication1.Dtos;
using WebApplication1.Entities;

namespace WebApplication1.Business.Abstract
{
    public interface IAlanAnalizSonucuService
    {
        Task<(AlanAnalizSonucuDto A, AlanAnalizSonucuDto B, AlanAnalizSonucuDto C)?> GetABCAsync(int userId);
        Task<List<AlanAnalizSonucuDto>> GetUnionResultsAsync(int userId);
        Task SaveOrUpdateAsync(AlanAnalizSonucuDto dto,int userId);
        Task<bool> ClearToAllAnaliz(int userId);
    }
}
