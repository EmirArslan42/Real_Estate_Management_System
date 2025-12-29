namespace WebApplication1.Dtos
{
    public class AlanAnalizSonucuDto
    {
        // D mi E mi
        public string Name { get; set; }
        // "A ∪ B" | "A ∪ B ∪ C"
        public string Operation { get; set; }

        // GeoJSON (string)
        public string Geometry { get; set; }

        // m²
        public double Area { get; set; }
    }
}