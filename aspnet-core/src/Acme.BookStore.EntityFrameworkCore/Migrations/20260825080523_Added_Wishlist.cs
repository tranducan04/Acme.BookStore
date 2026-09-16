using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acme.BookStore.Migrations
{
    /// <inheritdoc />
    public partial class Added_Wishlist : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppWishlistItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppWishlistItems", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppWishlistItems_UserId_BookId",
                table: "AppWishlistItems",
                columns: new[] { "UserId", "BookId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppWishlistItems");
        }
    }
}
