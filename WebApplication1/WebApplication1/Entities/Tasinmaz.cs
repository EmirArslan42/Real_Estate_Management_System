using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;


namespace WebApplication1.Entities
{
    public class Tasinmaz
    {
        public int Id { get; set; }

        [Required]
        public int MahalleId { get; set; } // mahalle id tutmak yeterli sadece 

        [ForeignKey("MahalleId")]
        public Mahalle Mahalle { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string ParcelNumber { get; set; } = null!; // parsel no

        [Required]
        [MaxLength(50)]
        public string LotNumber { get; set; } = null!; // ada no

        [Required]
        [MaxLength(150)]
        public string Address { get; set; } = null!;

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;


        [Required]
        [Column(TypeName = "geometry (Polygon, 4326)")]
        public Polygon Coordinate { get; set; } = null!;

        public byte[]? ImageData { get; set; }

        [MaxLength(50)]
        public string? ImageType { get; set; }
    }
}
