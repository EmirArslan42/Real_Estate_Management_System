using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Entities
{
    public class Il
    {
        public int Id { get; set; }

        [Required] [MaxLength(100)]
        public string Ad { get; set; } = null!;
    }
}
