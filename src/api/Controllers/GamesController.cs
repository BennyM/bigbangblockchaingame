using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Nethereum.Web3;
using System.Collections.Generic;
using System.Data;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using System.IO;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;
using api.Util;
using Nethereum.Hex.HexConvertors.Extensions;
using Nethereum.Web3.Accounts;
using Nethereum.Hex.HexTypes;
using Hangfire;
using api.Jobs;

namespace api.Data
{
    [Authorize]
    [Route("api/games")]
    public class GamesController
        : Controller
    {
        private BbbgContext _context;
        private IOptions<EthereumSettings> _account;
        public GamesController(BbbgContext context, IOptions<EthereumSettings> account)
        {
            _context = context;
            _account = account;
        }

        [Route("")]
        [HttpGet]
        public async Task<IEnumerable<GameOverviewModel>> GamesOfUser()
        {
            var userId = new Guid(User.Claims.Single(cl => cl.Type == ClaimTypes.NameIdentifier).Value);

            var data = await _context.Games
                .Include(x => x.Opponent)
                .Include(x => x.Challenger)
                .Include(x => x.Rounds)
                .Where(x => x.ChallengerId == userId || x.OpponentId == userId)
                .OrderByDescending(x => x.DateCreated)
                .ToListAsync();
            return data.Select(x => new GameOverviewModel
            {
                OpponentName = x.Challenger.Id == userId ? x.Opponent.Nickname : x.Challenger.Nickname,
                Address = x.Address,
                Id = x.Id,
                HandPlayed = x.ChallengerId == userId || (x.OpponentId == userId && x.Rounds.Last().HashedHandOpponent != null),
                CreateDate = x.DateCreated,
                GameInitiated = x.Challenger.Id == userId,
                CurrentRound = 0
            })
             .ToList();
        }

        [HttpPost]
        [Route("")]
        public async Task<long> CreateGame([FromBody]ChallengeOpponentModel model)
        {
            var challengerId = new Guid(User.Claims.Single(cl => cl.Type == ClaimTypes.NameIdentifier).Value);

            Game g = new Game
            {
                ChallengerId = challengerId,
                OpponentId = model.OpponentId,
                DateCreated = DateTime.UtcNow
            };
            g.Rounds.Add(new GameRound
            {
                HashedHandChallenger = model.HashedHand
            });
            _context.Games.Add(g);
            await _context.SaveChangesAsync();

            return g.Id;
        }

        [HttpPost]
        [Route("{id}/hand")]
        public async Task PlayHand(long id, [FromBody]RespondToChallengeModel model)
        {
            var playerId = new Guid(User.Claims.Single(cl => cl.Type == ClaimTypes.NameIdentifier).Value);

            var game = await _context.Games
                .Include(x => x.Rounds)
                .Include(x => x.Challenger)
                .Include(x => x.Opponent)
                .SingleAsync(x => x.Id == id);
            game.Rounds.Last().HashedHandOpponent = model.HashedHand;
            await _context.SaveChangesAsync();

            var assembly = typeof(GamesController).GetTypeInfo().Assembly;
            string abi = null;
            string binary = null;
            using (Stream resource = assembly.GetManifestResourceStream("api.BlindGame.json"))
            {
                using (var streamReader = new StreamReader(resource))
                {
                    var contract = streamReader.ReadToEnd();
                    JObject obj = JObject.Parse(contract);
                    abi = obj.Property("abi").Value.ToString();
                    binary = obj.Property("unlinked_binary").Value.ToString();
                }
            }

            var web3 = new Web3(_account.Value.Address);
            web3.TransactionManager = new AccountSignerTransactionManager(web3.Client, _account.Value.MasterAccountPrivateKey);
            var deployedContractResult = await web3.Eth.DeployContract.SendRequestAsync(abi, binary, _account.Value.MasterAccountAddress, new HexBigInteger(900000),
                game.Challenger.Address, game.Opponent.Address, HexByteConvertorExtensions.HexToByteArray(game.Rounds.Last().HashedHandChallenger), HexByteConvertorExtensions.HexToByteArray(game.Rounds.Last().HashedHandOpponent));
            game.CreatedTransactionHash = deployedContractResult;
            _context.SaveChanges();
            CreateGameAddressJob job = new CreateGameAddressJob(_context, _account);
            long gameId = game.Id;
            BackgroundJob.Schedule(() => job.PollForAddress(deployedContractResult, game.Id), TimeSpan.FromSeconds(5));



            await _context.SaveChangesAsync();


        }
    }

    public class GameOverviewModel
    {
        public string OpponentName { get; set; }
        public string ChallengerName { get; set; }
        public string Address { get; set; }

        public bool HandPlayed { get; set; }

        public DateTime CreateDate { get; set; }
        public bool GameInitiated { get; set; }
        public long Id { get; set; }

        public int CurrentRound { get; set; }
    }

    public class ChallengeOpponentModel
    {
        public Guid OpponentId { get; set; }
        public string HashedHand { get; set; }
    }

    public class RespondToChallengeModel
    {
        public int Round { get; set; }
        public string HashedHand { get; set; }
    }
}