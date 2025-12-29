using Microsoft.EntityFrameworkCore;
using NetTopologySuite.IO;
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


        public async Task<AutoSelectResultDto> AutoSelectAsync()
        {
            var writer = new GeoJsonWriter();

            var tasinmazlar = await _context.Tasinmazlar
                .OrderByDescending(x => x.Id)
                .Take(3).ToListAsync();

            if (tasinmazlar.Count < 3)
            {
                return null;
            }

            return new AutoSelectResultDto
            {
                A = new GeometryDto
                {
                    Id = tasinmazlar[0].Id,
                    Geometry = writer.Write(tasinmazlar[0].Coordinate)
                },
                B=new GeometryDto
                {
                    Id = tasinmazlar[1].Id,
                    Geometry = writer.Write(tasinmazlar[1].Coordinate),
                },
                C=new GeometryDto
                {
                    Id = tasinmazlar[2].Id,
                    Geometry = writer.Write(tasinmazlar[2].Coordinate),
                }
            };
                
        }

        public async Task<List<AlanAnalizSonucuDto>> GetResultsAsync()
        {
            return await _context.AlanAnalizSonuclari.OrderByDescending(x => x.CreatedAt)
                .Select(x => new AlanAnalizSonucuDto
                {
                    Name = x.Name,
                    Operation = x.Operation,
                    Geometry = x.Geometry,
                    Area = x.Area,
                }).ToListAsync();
        }

        public async Task<AlanAnalizSonucuDto> SaveUnionResultAsync(AlanAnalizSonucuDto dto)
        {
            var entity = new AlanAnalizSonucu
            {
                Name = dto.Name,
                Operation = dto.Operation,
                Geometry = dto.Geometry,
                Area = dto.Area,
            };

            _context.AlanAnalizSonuclari.Add(entity);
            await _context.SaveChangesAsync();

            return dto;
        }




    }
}
