using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Acme.BookStore.Migrations
{
    /// <inheritdoc />
    public partial class Added_AppChatMessages_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppChatMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SenderName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReceiverId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MessageText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    IsFromAdmin = table.Column<bool>(type: "bit", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppChatMessages", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppChatMessages");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "AppOrders");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "AppOrders");

            migrationBuilder.DropColumn(
                name: "CoverImage",
                table: "AppBooks");
        }
    }
}
