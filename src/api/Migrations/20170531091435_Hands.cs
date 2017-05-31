using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations
{
    public partial class Hands : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ChallengerHand",
                table: "Games",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OpponentHand",
                table: "Games",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChallengerHand",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "OpponentHand",
                table: "Games");
        }
    }
}
