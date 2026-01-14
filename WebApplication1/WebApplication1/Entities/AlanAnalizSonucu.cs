using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Entities
{
    public class AlanAnalizSonucu
    {
        public int Id { get; set; }

        // D veya E
        [Required]
        public string Name { get; set; } = null!;

        // "A ∪ B" | "A ∪ B ∪ C"
        [Required]
        public string Operation { get; set; } = null!;

        [Required]
        public string Geometry { get; set; } = null!;

        public double Area { get; set; }

        public int UserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}