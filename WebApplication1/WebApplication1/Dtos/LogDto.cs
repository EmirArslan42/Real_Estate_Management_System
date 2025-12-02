namespace WebApplication1.Dtos
{
    public class LogDto
    {
        public int Id { get; set; } 
        public int? UserId { get; set; }
        public string OperationType { get; set; }
        public string Description { get; set; }
        public string IpAddress { get; set; }
        public DateTime Timestamp { get; set; } 
    }
}
 