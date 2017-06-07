using System;
using System.Collections;
using System.Collections.Generic;

namespace api.Data
{
    public class Game
    {
        public Game()
        {
            Rounds = new List<GameRound>();
        }
        public long Id { get; set; }
        public Player Challenger { get; set; }
        public Guid ChallengerId { get; set; }
        public Player Opponent { get; set; }
        public Guid OpponentId { get; set; }
        public Player Winner { get; set; }
        public Guid? WinnerId { get; set; }
        public string Address { get; set; }

        public DateTime DateCreated { get; set; }

        public ICollection<GameRound> Rounds { get; set; }

        public string CreatedTransactionHash {get;set;}
        public string DrawEventFilterId { get;  set; }
        public string WinnerEventFilterId { get;  set; }

        public Hands WinningHand{get;set;}
        public Hands LosingHand {get;set;}
    }

    public class GameRound
    {
        public long Id { get; set; }
        public string HashedHandChallenger { get; set; }
        public string HashedHandOpponent { get; set; }

        public Game Game { get; set; }
        public long GameId { get; set; }

        public long RoundNumber {get;set;}
        public RoundOutcome Outcome {get;set;}

    
    }

    public enum RoundOutcome
    {
        None,
        Draw,
        Winner
    }
}