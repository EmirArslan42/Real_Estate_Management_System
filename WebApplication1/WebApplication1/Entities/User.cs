using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Entities
{
    public class User
    {
        public int Id { get; set; }


        [Required] [MaxLength(100)]
        public string Name { get; set; } = null!;


        [Required] [EmailAddress] [MaxLength(100)]
        public string Email { get; set; } = null!;


        [Required]
        public string Role { get; set; } = null!; // Admin veya User 

        [Required]
        public string PasswordHash { get; set; } = null!;

        public bool IsActive { get; set; } = true;

    }
}