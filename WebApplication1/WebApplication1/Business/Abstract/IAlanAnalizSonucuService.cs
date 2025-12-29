using WebApplication1.Dtos;
using WebApplication1.Entities;

namespace WebApplication1.Business.Abstract
{
    public interface IAlanAnalizSonucuService
    {
        Task<AutoSelectResultDto> AutoSelectAsync();
        Task<AlanAnalizSonucuDto> SaveUnionResultAsync(AlanAnalizSonucuDto dto);
        Task<List<AlanAnalizSonucuDto>> GetResultsAsync();
    }
}
