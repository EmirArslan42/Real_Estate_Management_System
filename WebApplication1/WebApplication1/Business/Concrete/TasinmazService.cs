using Microsoft.EntityFrameworkCore;
using WebApplication1.Business.Abstract;
using WebApplication1.DataAccess;
using WebApplication1.Dtos;
using WebApplication1.Entities;
using NetTopologySuite.IO;
using NetTopologySuite.Geometries;
using NetTopologySuite.Features;
using NetTopologySuite;


namespace WebApplication1.Business.Concrete
{
    public class TasinmazService:ITasinmazService
    {
        private readonly ApplicationDbContext _context;
        public TasinmazService(ApplicationDbContext context) {
            _context = context;
        }

        public async Task<(byte[] ImageData, string ImageType)?> GetImageAsync(int tasinmazId)
        {
            var tasinmaz = await _context.Tasinmazlar
                .Where(t => t.Id == tasinmazId)
                .Select(t => new
                {
                    t.ImageData,
                    t.ImageType
                })
                .FirstOrDefaultAsync();

            if (tasinmaz == null || tasinmaz.ImageData == null)
                return null;

            return (tasinmaz.ImageData, tasinmaz.ImageType);
        }


        public async Task<List<TasinmazListDto>> GetAllAsync(int userId)
        {
            var writer = new GeoJsonWriter();

            return await _context.Tasinmazlar
                .Include(t=>t.Mahalle)
                 .ThenInclude(m=>m.Ilce)
                  .ThenInclude(i=>i.Il)
                .Where(t=>t.UserId==userId)
                .Select(t=>new TasinmazListDto
                {
                    Id = t.Id,
                    LotNumber = t.LotNumber,
                    ParcelNumber = t.ParcelNumber,            
                    Address = t.Address,
                    Geometry = writer.Write(t.Coordinate),
                    MahalleAdi=t.Mahalle.Ad,
                    IlceAdi=t.Mahalle.Ilce.Ad,
                    IlAdi=t.Mahalle.Ilce.Il.Ad,
                  
                })
                .ToListAsync();
        }

        public async Task<List<TasinmazListDto>> GetAllForAdminAsync()
        {
            var writer = new GeoJsonWriter();

            return await _context.Tasinmazlar
                .Include(t => t.Mahalle)
                 .ThenInclude(m => m.Ilce)
                  .ThenInclude(i => i.Il)
                .Include(t => t.User)
                .Select(t => new TasinmazListDto
                {
                    Id = t.Id,
                    LotNumber = t.LotNumber,
                    ParcelNumber = t.ParcelNumber,
                    Address = t.Address,
                    Geometry = writer.Write(t.Coordinate),
                    MahalleAdi = t.Mahalle.Ad,
                    IlceAdi = t.Mahalle.Ilce.Ad,
                    IlAdi = t.Mahalle.Ilce.Il.Ad,

                    UserId=t.UserId,
                    UserEmail=t.User.Email,

                })
                .ToListAsync();
        }

        public async Task<Tasinmaz> GetByIdAsync(int id,int userId) 
        {
            return await _context.Tasinmazlar.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        }

        public async Task<bool> AddAsync(TasinmazDto dto,int userId)
        {
            try
            {
                Polygon? polygon = null;
                if (!string.IsNullOrEmpty(dto.Geometry))
                {
                    var reader = new GeoJsonReader();

                    var feature = reader.Read<Feature>(dto.Geometry);
                    polygon = feature.Geometry as Polygon;

                    if (polygon == null)
                    {
                        return false;
                    }
                }

                

                var tasinmaz = new Tasinmaz
                {
                    MahalleId = dto.MahalleId,
                    ParcelNumber = dto.ParcelNumber,
                    LotNumber = dto.LotNumber,
                    Address = dto.Address,
                    UserId = userId,

                    Coordinate = polygon,

                    ImageData = dto.ImageData,
                    ImageType = dto.ImageType,

                };

                await _context.Tasinmazlar.AddAsync(tasinmaz);
                await _context.SaveChangesAsync();
                return true;

            }catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<bool> AddFromExcelAsync(TasinmazExcelDto dto, int userId)
        {
            var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);

            // Boş veya varsayılan bir Polygon oluşturuyoruz (Kare şeklinde)
            // Koordinatlar: [0,0], [0,1], [1,1], [1,0], [0,0]
            var coords = new[] {
        new NetTopologySuite.Geometries.Coordinate(0, 0),
        new NetTopologySuite.Geometries.Coordinate(0, 0.0001),
        new NetTopologySuite.Geometries.Coordinate(0.0001, 0.0001),
        new NetTopologySuite.Geometries.Coordinate(0.0001, 0),
        new NetTopologySuite.Geometries.Coordinate(0, 0)
    };
            var defaultPolygon = geometryFactory.CreatePolygon(coords);

            var tasinmaz = new Tasinmaz
            {
                MahalleId = dto.MahalleId,
                LotNumber = dto.LotNumber,
                ParcelNumber = dto.ParcelNumber,
                Address = dto.Address,
                UserId = userId,
                Coordinate = defaultPolygon // Entity tipiniz Polygon ise bu çalışacaktır
            };

            await _context.Tasinmazlar.AddAsync(tasinmaz);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateAsync(int id,TasinmazDto dto,int userId, byte[]? imageData, string? imageType)
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

                if (imageData != null && imageType != null)
                {
                    tasinmaz.ImageData = imageData;
                    tasinmaz.ImageType = imageType;
                }



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
