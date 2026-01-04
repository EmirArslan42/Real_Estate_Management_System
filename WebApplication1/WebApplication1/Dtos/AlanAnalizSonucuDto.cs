namespace WebApplication1.Dtos
{
    public class AlanAnalizSonucuDto
    {
        public int Id { get; set; }
        // A,B,C,D,E
        public string Name { get; set; }

        // "A" | "B" | "C" | A ∪ B" | "A ∪ B ∪ C"
        public string Operation { get; set; }

        // GeoJSON (string)
        public string Geometry { get; set; }

        // m²
        public double Area { get; set; }
    }
}