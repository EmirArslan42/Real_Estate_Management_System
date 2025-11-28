using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Entities
{
    public class Mahalle
    {
        public int Id { get; set; }
        [Required] [MaxLength(100)] 
        public string Ad {  get; set; }
        [Required]
        public int IlceId { get; set; }

        [ForeignKey("IlceId")]
        public Ilce Ilce { get; set; }

    }
}
