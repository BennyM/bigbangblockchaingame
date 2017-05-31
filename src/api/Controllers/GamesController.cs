using System;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Data
{
    [Authorize]
    [Route("api/games")]
    public class GamesController
        : Controller
    {
        private BbbgContext _context;

        public GamesController(BbbgContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Route("")]
        public long CreateGame(Guid oponentId, string hashedHand)
        {
             var challengerId = new Guid(User.Claims.Single(cl => cl.Type == ClaimTypes.NameIdentifier).Value);
             Game g = new Game
             {
                ChallengerId = challengerId,
                OpponentId = oponentId,
                ChallengerHand = hashedHand,
             };
             _context.Games.Add(g);
             _context.SaveChanges();
             return g.Id;
        }

        [HttpPost]
        [Route("{id}/hand")]
        public void PlayHand(long id, string hashedHand)
        {
            var opponentId = new Guid(User.Claims.Single(cl => cl.Type == ClaimTypes.NameIdentifier).Value);
            var game = _context.Games.Single(x => x.Id == id && x.OpponentId == opponentId  && x.OpponentHand == null);
            game.OpponentHand = hashedHand;
            _context.SaveChanges();
        }
    }
}