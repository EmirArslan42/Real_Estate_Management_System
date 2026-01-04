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
        public async Task<(AlanAnalizSonucuDto A, AlanAnalizSonucuDto B, AlanAnalizSonucuDto C)?> GetABCAsync()
        {
            var list = await _context.AlanAnalizSonuclari
                .Where(x => x.Name == "A" || x.Name == "B" || x.Name == "C")
                .ToListAsync();

            if (list.Count != 3)
                return null;

            AlanAnalizSonucuDto Map(AlanAnalizSonucu x) => new AlanAnalizSonucuDto
            {
                Id = x.Id,
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

        public async Task<List<AlanAnalizSonucuDto>> GetUnionResultsAsync()
        {
            return await _context.AlanAnalizSonuclari
                .Where(x=>x.Name=="D" || x.Name=="E")
                .OrderBy(x=>x.Name)
                .Select(x=>new AlanAnalizSonucuDto
                {
                    Id=x.Id,
                    Name=x.Name,
                    Operation = x.Operation,
                    Geometry = x.Geometry,
                    Area = x.Area,
                })
                .ToListAsync();
        }

        public async Task<bool> ClearToAllAnaliz()
        {
            var all = await _context.AlanAnalizSonuclari
        .Where(x =>
            x.Name == "A" ||
            x.Name == "B" ||
            x.Name == "C" ||
            x.Name == "D" ||
            x.Name == "E")
        .ToListAsync();

            if (all.Any())
            {
                _context.AlanAnalizSonuclari.RemoveRange(all);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        // A / B / C / D / E → SAVE OR UPDATE (Name bazlı)
        public async Task SaveOrUpdateAsync(AlanAnalizSonucuDto dto) 
        {
            var existing = await _context.AlanAnalizSonuclari
                .FirstOrDefaultAsync(x => x.Name == dto.Name);

            if (existing != null)
            {
                // UPDATE işlemi
                existing.Geometry = dto.Geometry;
                existing.Area = dto.Area;
                existing.Operation = dto.Operation;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // INSERT işlemi
                var entity = new AlanAnalizSonucu
                {
                    Id=dto.Id,
                    Name = dto.Name,
                    Operation = dto.Operation,
                    Geometry = dto.Geometry,
                    Area = dto.Area,
                    CreatedAt = DateTime.UtcNow
                };

                _context.AlanAnalizSonuclari.Add(entity);
            }

            
            await _context.SaveChangesAsync();

        }

    }
}







//public async Task<AutoSelectResultDto> AutoSelectAsync()
//{
//    var writer = new GeoJsonWriter();

//    var tasinmazlar = await _context.Tasinmazlar
//        .OrderByDescending(x => x.Id)
//        .Take(3).ToListAsync();

//    if (tasinmazlar.Count < 3)
//    {
//        return null;
//    }

//    return new AutoSelectResultDto
//    {
//        A = new GeometryDto
//        {
//            Id = tasinmazlar[0].Id,
//            Geometry = writer.Write(tasinmazlar[0].Coordinate)
//        },
//        B=new GeometryDto
//        {
//            Id = tasinmazlar[1].Id,
//            Geometry = writer.Write(tasinmazlar[1].Coordinate),
//        },
//        C=new GeometryDto
//        {
//            Id = tasinmazlar[2].Id,
//            Geometry = writer.Write(tasinmazlar[2].Coordinate),
//        }
//    };

//}
