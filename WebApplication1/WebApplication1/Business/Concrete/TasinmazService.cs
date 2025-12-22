using Microsoft.EntityFrameworkCore;
using WebApplication1.Business.Abstract;
using WebApplication1.DataAccess;
using WebApplication1.Dtos;
using WebApplication1.Entities;
using NetTopologySuite.IO;
using NetTopologySuite.Geometries;
using NetTopologySuite.Features;


namespace WebApplication1.Business.Concrete
{
    public class TasinmazService:ITasinmazService
    {
        private readonly ApplicationDbContext _context;
        public TasinmazService(ApplicationDbContext context) {
            _context = context;
        }

        public async Task<List<Tasinmaz>> GetAllAsync(int userId)
        {
            return await _context.Tasinmazlar.Where(t=>t.UserId==userId).ToListAsync();
        }

        public async Task<Tasinmaz> GetByIdAsync(int id,int userId) 
        {
            return await _context.Tasinmazlar.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        }

        public async Task<bool> AddAsync(TasinmazDto dto,int userId)
        {
            try
            {
                var reader = new GeoJsonReader();

                var feature = reader.Read<Feature>(dto.Geometry);
                var polygon = feature.Geometry as Polygon;

                if (polygon == null)
                {
                    return false;
                }

                var tasinmaz = new Tasinmaz
                {
                    MahalleId = dto.MahalleId,
                    ParcelNumber = dto.ParcelNumber,
                    LotNumber = dto.LotNumber,
                    Address = dto.Address,
                    UserId = userId,

                    Coordinate = polygon,
                    

                };

                await _context.Tasinmazlar.AddAsync(tasinmaz);
                await _context.SaveChangesAsync();
                return true;

            }catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<bool> UpdateAsync(int id,TasinmazDto dto,int userId)
        {
            var tasinmaz =await _context.Tasinmazlar.FirstOrDefaultAsync(t=>t.Id==id && t.UserId==userId);
            if (tasinmaz==null)
            {
                return false;
            }

            try
            {
                var reader = new GeoJsonReader();

                tasinmaz.MahalleId = dto.MahalleId;
                tasinmaz.ParcelNumber = dto.ParcelNumber;
                tasinmaz.LotNumber = dto.LotNumber;
                tasinmaz.Address = dto.Address;
                tasinmaz.Coordinate = reader.Read<Polygon>(dto.Geometry);

                
                 _context.Tasinmazlar.Update(tasinmaz);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<bool> DeleteAsync(int id,int userId)
        {
            var tasinmaz=await _context.Tasinmazlar.FirstOrDefaultAsync(t=>t.Id==id && t.UserId==userId);

            if (tasinmaz==null)
            {
                return false;
            }

            try
            {
                _context.Tasinmazlar.Remove(tasinmaz);
                await _context.SaveChangesAsync();
                return true;

            }
            catch (Exception ex)
            {
                return false;
            }
            
        }
    }
}
