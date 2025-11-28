using Microsoft.EntityFrameworkCore;
using WebApplication1.Entities;
namespace WebApplication1.DataAccess
{
    public class ApplicationDbContext:DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext>options) : base(options)
        {

        }
        public DbSet <User> Users { get; set; }
        public DbSet <Tasinmaz> Tasinmazlar { get; set; }
        public DbSet<Il> Iller {  get; set; }
        public DbSet<Ilce> Ilceler { get; set; }
        public DbSet<Mahalle> Mahalleler { get; set; }
        public DbSet<Log> Logs { get; set; }


    } 
}
