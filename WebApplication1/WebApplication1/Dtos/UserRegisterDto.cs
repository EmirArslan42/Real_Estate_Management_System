using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Dtos
{
    public class UserRegisterDto
    {
        [Required]
        public string Name { get; set; }=string.Empty;

        [Required,EmailAddress]
        public string Email { get; set; }=string.Empty ;

        [Required,MinLength(8,ErrorMessage ="Şire en az 8 karakter olmalıdır.")]
        public string Password { get; set; }=string.Empty ;
    }
}
