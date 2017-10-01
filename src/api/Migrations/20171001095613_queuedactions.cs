using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;

namespace api.Migrations
{
    public partial class queuedactions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "QueuedActions",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Processed = table.Column<bool>(nullable: false),
                    QueueType = table.Column<int>(nullable: false),
                    QueuedOn = table.Column<DateTime>(nullable: false),
                    RoundId = table.Column<long>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QueuedActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QueuedActions_GameRound_RoundId",
                        column: x => x.RoundId,
                        principalTable: "GameRound",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_QueuedActions_RoundId",
                table: "QueuedActions",
                column: "RoundId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "QueuedActions");
        }
    }
}
