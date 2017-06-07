using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace api.Migrations
{
    public partial class States : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Verified",
                table: "Games");

            migrationBuilder.AddColumn<int>(
                name: "Outcome",
                table: "GameRound",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<long>(
                name: "RoundNumber",
                table: "GameRound",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<int>(
                name: "LosingHand",
                table: "Games",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WinningHand",
                table: "Games",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Outcome",
                table: "GameRound");

            migrationBuilder.DropColumn(
                name: "RoundNumber",
                table: "GameRound");

            migrationBuilder.DropColumn(
                name: "LosingHand",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "WinningHand",
                table: "Games");

            migrationBuilder.AddColumn<bool>(
                name: "Verified",
                table: "Games",
                nullable: false,
                defaultValue: false);
        }
    }
}
