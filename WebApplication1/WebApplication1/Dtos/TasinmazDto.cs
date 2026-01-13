using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Dtos
{
    public class TasinmazDto
    {
        public int MahalleId { get; set; }

        [Required]
        public string ParcelNumber { get; set; }=string.Empty;

        [Required]
        public string LotNumber { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty ;
        public string? Geometry { get; set; }

        public byte[]? ImageData { get; set; }
        public string? ImageType { get; set; }
    }
}
 