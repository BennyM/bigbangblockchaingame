using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("api/players")]
    [Authorize]
    public class PlayersController : Controller 
    {
        private readonly BbbgContext _context;

        public PlayersController(BbbgContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var userId = new Guid(User.Claims.Single(cl => cl.Type == ClaimTypes.NameIdentifier).Value);

            var players = await _context.Players
                .Where(x=> x.Address != null && x.Id != userId)
                .Select(x => new { x.Id, x.Nickname})
                .OrderBy(x => x.Nickname)
                .ToListAsync();
            return Ok(players);
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody]AddPlayerRequest request)
        {
            if(ModelState.IsValid)
            {
                var newPlayer = new Player 
                {
                    Id = Guid.NewGuid(),
                    Email = request.Email,
                    Nickname = request.Nickname,
                    LousySecurityKey = Guid.NewGuid()
                };
                
                _context.Players.Add(newPlayer);
                await _context.SaveChangesAsync();

                return Ok(newPlayer.LousySecurityKey);
            }

            return BadRequest();
        }
    }

    public class AddPlayerRequest
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Nickname { get; set; }
    }
}