namespace WebApplication1.Dtos
{
    public class AlanAnalizSonucuDto
    {
        public int Id { get; set; }

        // A,B,C,D,E
        public string Name { get; set; }=string.Empty;


        // "A" | "B" | "C" | A ∪ B" | "A ∪ B ∪ C"
        public string Operation { get; set; } = string.Empty;   


        // GeoJSON (string)
        public string Geometry { get; set; } = string.Empty;

        public double Area { get; set; }
    }
}