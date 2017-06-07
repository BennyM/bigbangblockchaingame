using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations
{
    public partial class FilterIds : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DrawEventFilterId",
                table: "Games",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WinnerEventFilterId",
                table: "Games",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DrawEventFilterId",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "WinnerEventFilterId",
                table: "Games");
        }
    }
}
