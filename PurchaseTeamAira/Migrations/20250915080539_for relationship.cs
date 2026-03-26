using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PurchaseTeamAira.Migrations
{
    public partial class forrelationship : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "isDeleted",
                table: "Users",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "isApproved",
                table: "Users",
                newName: "IsApproved");

            migrationBuilder.RenameColumn(
                name: "isDeleted",
                table: "Locations",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "isApproved",
                table: "Locations",
                newName: "IsApproved");

            migrationBuilder.RenameColumn(
                name: "isDeleted",
                table: "Departments",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "isApproved",
                table: "Departments",
                newName: "IsApproved");

            migrationBuilder.RenameColumn(
                name: "isDeleted",
                table: "Companies",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "isApproved",
                table: "Companies",
                newName: "IsApproved");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Users",
                newName: "isDeleted");

            migrationBuilder.RenameColumn(
                name: "IsApproved",
                table: "Users",
                newName: "isApproved");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Locations",
                newName: "isDeleted");

            migrationBuilder.RenameColumn(
                name: "IsApproved",
                table: "Locations",
                newName: "isApproved");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Departments",
                newName: "isDeleted");

            migrationBuilder.RenameColumn(
                name: "IsApproved",
                table: "Departments",
                newName: "isApproved");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Companies",
                newName: "isDeleted");

            migrationBuilder.RenameColumn(
                name: "IsApproved",
                table: "Companies",
                newName: "isApproved");
        }
    }
}
