using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;

namespace WebApplication1.Entities
{
    public class Log
    {
        public int Id { get; set; }

        public int? UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }
        public string? IpAddress { get; set; }

        [Required]
        public string OperationType { get; set; } = null!; // login,updateUser,addProperty gibi ...

        [MaxLength(350)]
        public string? Description {  get; set; }
        public DateTime Timestamp { get; set; }=DateTime.UtcNow; // log zamanını baz alır
    }
}
