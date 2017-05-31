using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace api.Data
{
    public class Player
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string Nickname { get; set; }
        public Guid LousySecurityKey { get; set; }

        public string Address { get; set; }
        [InverseProperty("Challenger")]
        public ICollection<Game> ChallengerGames {get;set;}
        [InverseProperty("Opponent")]
        public ICollection<Game> OpponentGames {get;set;}
    }

    public class BbbgContext : DbContext
    {
        public BbbgContext(DbContextOptions<BbbgContext> options)
            : base(options)
        {
        }

        public DbSet<Player> Players { get; set; }

        public DbSet<Game> Games { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Player>()
                .HasIndex(x => x.Email)
                .IsUnique(true);

        }
    }
}