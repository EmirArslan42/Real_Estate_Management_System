using Microsoft.EntityFrameworkCore;
using WebApplication1.Business.Abstract;
using WebApplication1.DataAccess;
using WebApplication1.Dtos;

namespace WebApplication1.Business.Concrete
{
    public class LocationService : ILocationService
    {
        private readonly ApplicationDbContext _context;
        public LocationService(ApplicationDbContext context) {
            _context = context;
        }
        public async Task<List<IlDto>> GetIllerAsync()
        {
            return await _context.Iller.Select(i=>new IlDto
            {
                Id= i.Id,
                Ad=i.Ad,
            }).ToListAsync();
        }
        
        public async Task<List<IlceDto>> GetIlcelerAsync(int ilId)
        {
            return await _context.Ilceler.Where(i=>i.IlId==ilId).Select(i=>new IlceDto
            {
                Id= i.Id,
                Ad= i.Ad,
                IlId= ilId,
            }).ToListAsync();
        }

        public async Task<List<MahalleDto>> GetMahallelerAsync(int ilceId)
        {
            return await _context.Mahalleler.Where(m=>m.IlceId==ilceId).Select(m=>new MahalleDto
            {
                Id= m.Id,
                Ad=m.Ad,
                IlceId= ilceId,
            }).ToListAsync();
        }
    }
}
