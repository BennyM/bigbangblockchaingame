using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;

namespace api.Migrations
{
    public partial class Game : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Players",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Games",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ChallengerId = table.Column<Guid>(nullable: false),
                    OpponentId = table.Column<Guid>(nullable: false),
                    Verified = table.Column<bool>(nullable: false),
                    WinnerId = table.Column<Guid>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Games", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Games_Players_ChallengerId",
                        column: x => x.ChallengerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Games_Players_OpponentId",
                        column: x => x.OpponentId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Games_Players_WinnerId",
                        column: x => x.WinnerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Games_ChallengerId",
                table: "Games",
                column: "ChallengerId");

            migrationBuilder.CreateIndex(
                name: "IX_Games_OpponentId",
                table: "Games",
                column: "OpponentId");

            migrationBuilder.CreateIndex(
                name: "IX_Games_WinnerId",
                table: "Games",
                column: "WinnerId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Games");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Players");
        }
    }
}
