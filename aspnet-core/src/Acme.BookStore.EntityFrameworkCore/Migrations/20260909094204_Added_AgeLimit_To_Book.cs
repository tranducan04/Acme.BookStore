using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acme.BookStore.Migrations
{
    /// <inheritdoc />
    public partial class Added_AgeLimit_To_Book : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AgeLimit",
                table: "AppBooks",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AgeLimit",
                table: "AppBooks");
        }
    }
}
