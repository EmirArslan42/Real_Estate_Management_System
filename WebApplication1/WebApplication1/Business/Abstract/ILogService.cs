using WebApplication1.Dtos;
using WebApplication1.Entities;

namespace WebApplication1.Business.Abstract
{
    public interface ILogService
    {
        Task AddLogAsync(Log log);
        Task<List<LogDto>> GetAllLogsAsync();
        Task<List<LogDto>> GetLogsByUserIdAsync(int userId);

    }
}
 