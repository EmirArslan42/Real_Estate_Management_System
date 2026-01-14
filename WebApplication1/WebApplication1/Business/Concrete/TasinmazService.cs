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
        private readonly ILogService _logService;
        public TasinmazService(ApplicationDbContext context,ILogService logService) {
            _context = context;
            _logService = logService;
        }

        public async Task<(byte[] ImageData, string? ImageType)?> GetImageAsync(int tasinmazId)
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

            var list= await _context.Tasinmazlar
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

            await _logService.AddLogAsync(new Log
            {
                UserId = userId,
                OperationType = "GetAllTasinmaz",
                Description = $"Kullanici tüm tasinmazlarini listeledi.Tasinmaz count {list.Count}",
            });

            return list;
        }

        public async Task<List<TasinmazListDto>> GetAllForAdminAsync(int userId)
        {
            var writer = new GeoJsonWriter();
           
            var list= await _context.Tasinmazlar
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

            await _logService.AddLogAsync(new Log
            {
                UserId = userId,
                OperationType = "AdminGetAllTasinmaz",
                Description = "Admin tum kullanicilarin tasinmazlarini goruntuledi",
            });

            return list;
        }

        public async Task<TasinmazDto?> GetByIdAsync(int id,int userId) 
        {
            var tasinmaz= await _context.Tasinmazlar.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            var writer = new GeoJsonWriter();

            if (tasinmaz == null) return null;

            await _logService.AddLogAsync(new Log
            {
                UserId = userId,
                OperationType = "GetTasinmazById",
                Description = $"Kullanici ID: {id} olan tasinmazini goruntuledi",
            });

            return new TasinmazDto
            {
                MahalleId = tasinmaz.MahalleId,
                LotNumber = tasinmaz.LotNumber,
                Address = tasinmaz.Address,
                ParcelNumber = tasinmaz.ParcelNumber,
                Geometry = writer.Write(tasinmaz.Coordinate)
            };
        }

        public async Task<bool> AddAsync(TasinmazDto dto,int userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Geometry))
                {
                    throw new InvalidOperationException("Taşınmaz için koordinat bilgisi zorunludur.");
                }

                    var reader = new GeoJsonReader();
                    var feature = reader.Read<Feature>(dto.Geometry);

                    var polygon = feature.Geometry as Polygon ?? throw new InvalidOperationException("Geçersiz koordinat formatı.");
                                

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

                await _logService.AddLogAsync(new Log
                {
                    UserId = userId,
                    OperationType = "AddTasinmaz",
                    Description = $"Yeni taşınmaz eklendi. ParcelNumber: {dto.ParcelNumber}"
                });

                return true;

            }catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> AddFromExcelAsync(TasinmazExcelDto dto, int userId)
        {
            var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);

            // Boş veya varsayılan bir Polygon oluşturuyoruz - Kare şeklinde - Koordinatlar: [0,0], [0,1], [1,1], [1,0], [0,0]
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
                Coordinate = defaultPolygon // Entity tipimiz Polygon ise bu çalışmalı
            };

            await _context.Tasinmazlar.AddAsync(tasinmaz);
            await _context.SaveChangesAsync();

            await _logService.AddLogAsync(new Log
            {
                UserId = userId,
                OperationType = "AddTasinmazFromExcel",
                Description = $"Kullanici yeni tasinmaz ekledi. ParcelNumber: {dto.ParcelNumber}",
            });

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

               await _logService.AddLogAsync(new Log
                {
                    UserId = userId,
                    OperationType = "UpdateTasinmaz",
                    Description = $"Kullanici ID: {id} tasinmazi guncelledi",                    
                });

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> DeleteAsync(int id,int userId)
        {
            var tasinmaz=await _context.Tasinmazlar.FirstOrDefaultAsync(t=>t.Id==id && t.UserId==userId);

            if (tasinmaz==null)
                return false;

            try
            {
                _context.Tasinmazlar.Remove(tasinmaz);
                await _context.SaveChangesAsync();

               await _logService.AddLogAsync(new Log
                {
                    UserId = userId,
                    OperationType = "DeleteTasinmaz",
                    Description = $"Kullanici ID:{id} olan tasinmazi sildi.",
                });
                return true;
            }
            catch (Exception)
            {
                return false;
            }
            
        }
    }
}