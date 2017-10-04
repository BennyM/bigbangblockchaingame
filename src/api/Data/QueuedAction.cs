using System;

namespace api.Data
{
     public enum QueueTypes
    {
        CreateGame,
        PlayHand
    }
    public class QueuedAction
    {
        public long Id { get; set; }
        public bool Processed { get; set; }

        public long RoundId { get; set; }
        public GameRound Round { get; set; }

        public DateTime QueuedOn {get;set;}
        public QueueTypes QueueType {get;set;}

    }

    
}
