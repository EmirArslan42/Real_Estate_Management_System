namespace WebApplication1.Dtos
{
    public class TasinmazCreateWithImageDto
    {
        public int MahalleId { get; set; }
        public string ParcelNumber { get; set; }
        public string LotNumber { get; set; }
        public string Address { get; set; }

        public string? Geometry { get; set; }

        public IFormFile? Image { get; set; }
    }
}
