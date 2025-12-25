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
        public Mahalle Mahalle { get; set; }

        [Required] [MaxLength(50)]
        public string ParcelNumber { get; set; } // parsel no

        [Required] [MaxLength(50)]
        public string LotNumber { get; set; } // ada no

        [Required] [MaxLength(150)] 
        public string Address {  get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }


        [Required]
        [Column(TypeName = "geometry (Polygon, 4326)")]
        public Polygon Coordinate { get; set; }
        
        public string? ImagePath { get; set; }
    }
}
