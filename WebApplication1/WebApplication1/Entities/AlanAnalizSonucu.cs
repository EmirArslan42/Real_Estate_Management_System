namespace WebApplication1.Entities
{
    public class AlanAnalizSonucu
    {
        public int Id { get; set; }

        // D veya E
        public string Name { get; set; }

        // "A ∪ B" | "A ∪ B ∪ C"
        public string Operation { get; set; }

        public string Geometry { get; set; }

        // m²
        public double Area { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
