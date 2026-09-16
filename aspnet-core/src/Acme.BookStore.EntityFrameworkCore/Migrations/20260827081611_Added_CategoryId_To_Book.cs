using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acme.BookStore.Migrations
{
    /// <inheritdoc />
    public partial class Added_CategoryId_To_Book : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "AppBooks",
                type: "uniqueidentifier",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "AppBooks");
        }
    }
}
