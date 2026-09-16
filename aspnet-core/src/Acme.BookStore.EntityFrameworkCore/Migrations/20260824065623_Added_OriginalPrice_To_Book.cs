using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acme.BookStore.Migrations
{
    /// <inheritdoc />
    public partial class Added_OriginalPrice_To_Book : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<float>(
                name: "OriginalPrice",
                table: "AppBooks",
                type: "real",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Để trống để rollback không bị báo lỗi thiếu cột
        }
    }
}
