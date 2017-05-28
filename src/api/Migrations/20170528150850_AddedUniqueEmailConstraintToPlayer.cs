using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations
{
    public partial class AddedUniqueEmailConstraintToPlayer : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Players",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Players_Email",
                table: "Players",
                column: "Email",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Players_Email",
                table: "Players");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Players",
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);
        }
    }
}
