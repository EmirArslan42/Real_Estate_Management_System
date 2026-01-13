using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Dtos
{
    public class TasinmazExcelDto
    {
        public int MahalleId { get; set; }

        [Required]
        public string LotNumber { get; set; } = string.Empty;

        [Required]
        public string ParcelNumber { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty ;
    }
}
