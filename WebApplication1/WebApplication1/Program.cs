using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using WebApplication1.Business.Abstract;
using WebApplication1.Business.Concrete;
using WebApplication1.DataAccess;

// PostgreSQL Baðlantýsý
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ApplicationDbContext>(optitons => optitons.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS - Angular ile iletiþim kurmak için
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyHeader() // her türlü header
        .AllowAnyOrigin() // tüm domainler
        .AllowAnyMethod(); // http istekleri
    });
});

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IUserService, UserService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins"); // authorizationdan önce olmalý
app.UseAuthorization();

app.MapControllers();

app.Run();
