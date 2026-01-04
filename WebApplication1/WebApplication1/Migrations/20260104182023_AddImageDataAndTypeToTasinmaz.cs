using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class AddImageDataAndTypeToTasinmaz : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImagePath",
                table: "Tasinmazlar");

            migrationBuilder.AddColumn<byte[]>(
                name: "ImageData",
                table: "Tasinmazlar",
                type: "bytea",
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<string>(
                name: "ImageType",
                table: "Tasinmazlar",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageData",
                table: "Tasinmazlar");

            migrationBuilder.DropColumn(
                name: "ImageType",
                table: "Tasinmazlar");

            migrationBuilder.AddColumn<string>(
                name: "ImagePath",
                table: "Tasinmazlar",
                type: "text",
                nullable: true);
        }
    }
}
