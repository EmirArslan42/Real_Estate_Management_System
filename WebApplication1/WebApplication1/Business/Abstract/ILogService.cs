using WebApplication1.Entities;

namespace WebApplication1.Business.Abstract
{
    public interface ILogService
    {
        void AddLog(Log log);
        List<Log> GetAllLogs(); 
    }
}
 