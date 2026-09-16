using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acme.BookStore.Migrations
{
    /// <inheritdoc />
    public partial class Added_PublisherId_To_Book : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AppCartItems_CartId_BookId",
                table: "AppCartItems");

            migrationBuilder.AddColumn<Guid>(
                name: "PublisherId",
                table: "AppBooks",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppCartItems_BookId",
                table: "AppCartItems",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_AppCartItems_CartId",
                table: "AppCartItems",
                column: "CartId");

            migrationBuilder.CreateIndex(
                name: "IX_AppBooks_PublisherId",
                table: "AppBooks",
                column: "PublisherId");

            migrationBuilder.CreateIndex(
                name: "IX_AppAuthors_Name",
                table: "AppAuthors",
                column: "Name");

            migrationBuilder.AddForeignKey(
                name: "FK_AppBooks_AppPublishers_PublisherId",
                table: "AppBooks",
                column: "PublisherId",
                principalTable: "AppPublishers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppCartItems_AppBooks_BookId",
                table: "AppCartItems",
                column: "BookId",
                principalTable: "AppBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppBooks_AppPublishers_PublisherId",
                table: "AppBooks");

            migrationBuilder.DropForeignKey(
                name: "FK_AppCartItems_AppBooks_BookId",
                table: "AppCartItems");

            migrationBuilder.DropIndex(
                name: "IX_AppCartItems_BookId",
                table: "AppCartItems");

            migrationBuilder.DropIndex(
                name: "IX_AppCartItems_CartId",
                table: "AppCartItems");

            migrationBuilder.DropIndex(
                name: "IX_AppBooks_PublisherId",
                table: "AppBooks");

            migrationBuilder.DropIndex(
                name: "IX_AppAuthors_Name",
                table: "AppAuthors");

            migrationBuilder.DropColumn(
                name: "PublisherId",
                table: "AppBooks");

            migrationBuilder.CreateIndex(
                name: "IX_AppCartItems_CartId_BookId",
                table: "AppCartItems",
                columns: new[] { "CartId", "BookId" },
                unique: true);
        }
    }
}
