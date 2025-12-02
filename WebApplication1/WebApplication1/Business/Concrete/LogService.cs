using WebApplication1.Business.Abstract;
using WebApplication1.DataAccess;
using WebApplication1.Entities;

namespace WebApplication1.Business.Concrete
{
    public class LogService:ILogService
    {
        private readonly ApplicationDbContext _context;
        public LogService(ApplicationDbContext context) {
            _context = context;
        }
         
        public void AddLog(Log log)
        {
            _context.Logs.Add(log);
            _context.SaveChanges();
        }

        public List<Log> GetAllLogs()
        {
            return _context.Logs.OrderByDescending(l=>l.Timestamp).ToList();
        }
    }
}
