using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Dtos
{
    public class UserWriteDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Role {  get; set; } = string.Empty;

        [Required,EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
