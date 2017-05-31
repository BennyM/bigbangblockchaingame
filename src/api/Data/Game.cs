using System;

namespace api.Data
{
    public class Game
    {
        public long Id { get; set; }
        public Player Challenger { get; set; }
        public Guid ChallengerId { get; set; }
        public Player Opponent { get; set; }
        public Guid OpponentId { get; set; }
        public bool Verified { get; set; }
        public Player Winner { get; set; }
        public Guid? WinnerId { get; set; }

        public string ChallengerHand { get; set; }
        public string OpponentHand { get; set; }

        public string Address { get; set; }

        public DateTime DateCreated { get; set; }
    }
}