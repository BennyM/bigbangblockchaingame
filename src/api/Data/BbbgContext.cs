using Microsoft.EntityFrameworkCore;

namespace api.Data
{
    public class BbbgContext : DbContext
    {
        public BbbgContext(DbContextOptions<BbbgContext> options)
            : base(options)
        {
        }

        public DbSet<Player> Players { get; set; }

        public DbSet<Game> Games { get; set; }
    }
}