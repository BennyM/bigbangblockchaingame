using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;

namespace api.Migrations
{
    public partial class GameRound : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChallengerHand",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "OpponentHand",
                table: "Games");

            migrationBuilder.CreateTable(
                name: "GameRound",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    GameId = table.Column<long>(nullable: false),
                    HashedHandChallenger = table.Column<string>(nullable: true),
                    HashedHandOpponent = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameRound", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GameRound_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GameRound_GameId",
                table: "GameRound",
                column: "GameId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GameRound");

            migrationBuilder.AddColumn<string>(
                name: "ChallengerHand",
                table: "Games",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OpponentHand",
                table: "Games",
                nullable: true);
        }
    }
}
