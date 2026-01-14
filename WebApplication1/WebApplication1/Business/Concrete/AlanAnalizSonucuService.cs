using Microsoft.EntityFrameworkCore;
using WebApplication1.Business.Abstract;
using WebApplication1.DataAccess;
using WebApplication1.Dtos;
using WebApplication1.Entities; 

namespace WebApplication1.Business.Concrete
{
    public class AlanAnalizSonucuService : IAlanAnalizSonucuService
    {
        private readonly ApplicationDbContext _context;

        public AlanAnalizSonucuService(ApplicationDbContext context)
        {
            _context = context;
        }

        // AUTO SELECT → A / B / C
        public async Task<(AlanAnalizSonucuDto A, AlanAnalizSonucuDto B, AlanAnalizSonucuDto C)?> GetABCAsync(int userId)
        {
            var list = await _context.AlanAnalizSonuclari
                .Where(x=> x.UserId==userId && (x.Name == "A" || x.Name == "B" || x.Name == "C"))
                .ToListAsync();

            if (list.Count != 3)
                return null;

            static AlanAnalizSonucuDto Map(AlanAnalizSonucu x) => new AlanAnalizSonucuDto
            {
                Name = x.Name,
                Operation = x.Operation,
                Geometry = x.Geometry,
                Area = x.Area,
            };

            return (
                Map(list.First(x => x.Name == "A")),
                Map(list.First(x => x.Name == "B")),
                Map(list.First(x => x.Name == "C"))
            );
        }


        public async Task<List<AlanAnalizSonucuDto>> GetUnionResultsAsync(int userId)
        {
            return await _context.AlanAnalizSonuclari
                .Where(x=>
                x.UserId==userId && 
                (x.Name == "D" || x.Name == "E"))
                .OrderBy(x=>x.Name)
                .Select(x=>new AlanAnalizSonucuDto
                {
                    Name=x.Name,
                    Operation = x.Operation,
                    Geometry = x.Geometry,
                    Area = x.Area,
                })
                .ToListAsync();
        }


        public async Task ClearToAllAnaliz(int userId)
        {
            var all = await _context.AlanAnalizSonuclari
                .Where(x =>
                x.UserId==userId &&
                (x.Name == "A" ||
                    x.Name == "B" ||
                    x.Name == "C" ||
                    x.Name == "D" ||
                    x.Name == "E"))
                .ToListAsync();

            if (all.Count == 0)
                return;
            _context.AlanAnalizSonuclari.RemoveRange(all);
            await _context.SaveChangesAsync();
        }
       
        // A / B / C / D / E → save or update (name bazlı)
        public async Task SaveOrUpdateAsync(AlanAnalizSonucuDto dto,int userId) 
        {
            var existing = await _context.AlanAnalizSonuclari
                .FirstOrDefaultAsync(x => x.Name == dto.Name && x.UserId==userId);

            if (existing != null)
            {
                // update işlemi
                existing.Geometry = dto.Geometry;
                existing.Area = dto.Area;
                existing.Operation = dto.Operation;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // insert işlemi
                var entity = new AlanAnalizSonucu
                {
                    Name = dto.Name,
                    Operation = dto.Operation,
                    Geometry = dto.Geometry,
                    Area = dto.Area,
                    UserId=userId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.AlanAnalizSonuclari.Add(entity);
            }
            
            await _context.SaveChangesAsync();

        }

    }
}