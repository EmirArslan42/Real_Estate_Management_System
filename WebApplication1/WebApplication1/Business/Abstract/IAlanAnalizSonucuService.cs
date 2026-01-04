using WebApplication1.Dtos;
using WebApplication1.Entities;

namespace WebApplication1.Business.Abstract
{
    public interface IAlanAnalizSonucuService
    {
        //Task<AutoSelectResultDto> AutoSelectAsync();
        //Task<AlanAnalizSonucuDto> SaveUnionResultAsync(AlanAnalizSonucuDto dto);
        Task<(AlanAnalizSonucuDto A, AlanAnalizSonucuDto B, AlanAnalizSonucuDto C)?> GetABCAsync();
        Task<List<AlanAnalizSonucuDto>> GetUnionResultsAsync();
        Task SaveOrUpdateAsync(AlanAnalizSonucuDto dto);
        Task<bool> ClearToAllAnaliz();
        //Task ClearToAllAnaliz();
    }
}
