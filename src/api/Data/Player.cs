using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

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
}