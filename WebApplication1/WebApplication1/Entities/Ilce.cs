using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Entities
{
    public class Ilce
    {
        public int Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string Ad { get; set; } = null!;
        [Required]
        public int IlId { get; set; }

        [ForeignKey("IlId")]
        public Il Il { get; set; }=null!;
    }
}
