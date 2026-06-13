using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTableAreasConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tables_TableArea_TableAreaId",
                table: "Tables");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TableArea",
                table: "TableArea");

            migrationBuilder.RenameTable(
                name: "TableArea",
                newName: "TableAreas");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TableAreas",
                table: "TableAreas",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tables_TableAreas_TableAreaId",
                table: "Tables",
                column: "TableAreaId",
                principalTable: "TableAreas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tables_TableAreas_TableAreaId",
                table: "Tables");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TableAreas",
                table: "TableAreas");

            migrationBuilder.RenameTable(
                name: "TableAreas",
                newName: "TableArea");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TableArea",
                table: "TableArea",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tables_TableArea_TableAreaId",
                table: "Tables",
                column: "TableAreaId",
                principalTable: "TableArea",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
