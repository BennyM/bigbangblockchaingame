using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations
{
    public partial class RemovedEmail : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Players_Email",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Players");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Players",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Players_Email",
                table: "Players",
                column: "Email",
                unique: true);
        }
    }
}
