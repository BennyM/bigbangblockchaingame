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
    }
}