using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using api.Data;

namespace api.Migrations
{
    [DbContext(typeof(BbbgContext))]
    [Migration("20171001095613_queuedactions")]
    partial class queuedactions
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "1.1.2")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("api.Data.Game", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Address");

                    b.Property<Guid>("ChallengerId");

                    b.Property<string>("CreatedTransactionHash");

                    b.Property<DateTime>("DateCreated");

                    b.Property<string>("DrawEventFilterId");

                    b.Property<int>("LosingHand");

                    b.Property<Guid>("OpponentId");

                    b.Property<string>("WinnerEventFilterId");

                    b.Property<Guid?>("WinnerId");

                    b.Property<int>("WinningHand");

                    b.HasKey("Id");

                    b.HasIndex("ChallengerId");

                    b.HasIndex("OpponentId");

                    b.HasIndex("WinnerId");

                    b.ToTable("Games");
                });

            modelBuilder.Entity("api.Data.GameRound", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<long>("GameId");

                    b.Property<string>("HashedHandChallenger");

                    b.Property<string>("HashedHandOpponent");

                    b.Property<bool>("Mined");

                    b.Property<int>("Outcome");

                    b.Property<long>("RoundNumber");

                    b.HasKey("Id");

                    b.HasIndex("GameId");

                    b.ToTable("GameRound");
                });

            modelBuilder.Entity("api.Data.Player", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Address");

                    b.Property<Guid>("LousySecurityKey");

                    b.Property<string>("Nickname");

                    b.HasKey("Id");

                    b.ToTable("Players");
                });

            modelBuilder.Entity("api.Data.QueuedAction", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<bool>("Processed");

                    b.Property<int>("QueueType");

                    b.Property<DateTime>("QueuedOn");

                    b.Property<long>("RoundId");

                    b.HasKey("Id");

                    b.HasIndex("RoundId");

                    b.ToTable("QueuedActions");
                });

            modelBuilder.Entity("api.Data.Game", b =>
                {
                    b.HasOne("api.Data.Player", "Challenger")
                        .WithMany("ChallengerGames")
                        .HasForeignKey("ChallengerId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("api.Data.Player", "Opponent")
                        .WithMany("OpponentGames")
                        .HasForeignKey("OpponentId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("api.Data.Player", "Winner")
                        .WithMany()
                        .HasForeignKey("WinnerId");
                });

            modelBuilder.Entity("api.Data.GameRound", b =>
                {
                    b.HasOne("api.Data.Game", "Game")
                        .WithMany("Rounds")
                        .HasForeignKey("GameId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("api.Data.QueuedAction", b =>
                {
                    b.HasOne("api.Data.GameRound", "Round")
                        .WithMany()
                        .HasForeignKey("RoundId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
        }
    }
}
