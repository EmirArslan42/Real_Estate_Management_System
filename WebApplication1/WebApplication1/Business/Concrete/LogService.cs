using Microsoft.EntityFrameworkCore;
using WebApplication1.Business.Abstract;
using WebApplication1.DataAccess;
using WebApplication1.Dtos;
using WebApplication1.Entities;

namespace WebApplication1.Business.Concrete
{
    public class LogService:ILogService
    {
        private readonly ApplicationDbContext _context;
        public LogService(ApplicationDbContext context) {
            _context = context;
        }
         
        public async Task AddLogAsync(Log log) 
        {
            _context.Logs.Add(log);
           await _context.SaveChangesAsync();
        }

        public async Task<List<LogDto>> GetAllLogsAsync()
        {
            return await _context.Logs.OrderByDescending(l=>l.Timestamp)
                .Select(l=>new LogDto
                {
                    Id = l.Id,
                    UserId = l.UserId,
                    OperationType = l.OperationType,
                    Description = l.Description,
                    IpAddress = l.IpAddress,
                    Timestamp = l.Timestamp
                })
                .ToListAsync();
        }

        public async Task<List<LogDto>> GetLogsByUserIdAsync(int userId)
        {
            return await _context.Logs
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.Timestamp)
                .Select(l => new LogDto
                {
                    Id = l.Id,
                    UserId = l.UserId,
                    OperationType = l.OperationType,
                    Description = l.Description,
                    IpAddress = l.IpAddress,
                    Timestamp = l.Timestamp
                })
                .ToListAsync();
        }
    }
}