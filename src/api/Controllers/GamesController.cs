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
using Nethereum.ABI.Encoders;

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
            List<GameOverviewModel> models = new List<GameOverviewModel>();
            var games = await _context.Games
                .AsNoTracking()
                .Include(x => x.Opponent)
                .Include(x => x.Challenger)
                .Include(x => x.Rounds)
                .Include(x => x.Winner)
                .Where(x => x.ChallengerId == userId || x.OpponentId == userId)
                .OrderByDescending(x => x.DateCreated)
                .ToListAsync();
            foreach (var game in games)
            {
                var lastRound = game.Rounds.OrderBy(x => x.RoundNumber).Last();
                models.Add(
                new GameOverviewModel
                {
                    OpponentName = game.Challenger.Id == userId ? game.Opponent.Nickname : game.Challenger.Nickname,
                    Address = game.Address,
                    Id = game.Id,
                    HandPlayed = game.ChallengerId == userId ? lastRound.HashedHandChallenger != null : lastRound.HashedHandOpponent != null,
                    CreateDate = game.DateCreated,
                    GameInitiated = game.Challenger.Id == userId,
                    CurrentRound = lastRound.RoundNumber,
                    Winner = game.Winner != null ? game.Winner.Id == userId : (bool?)null,
                    CanBeConfirmed = lastRound.Mined
                });
            }
            return models;
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
                HashedHandChallenger = model.HashedHand,
                RoundNumber = 0

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
            var currentRound = game.Rounds.OrderBy(x => x.RoundNumber).Last();

            if (playerId == game.Challenger.Id)
            {
                currentRound.HashedHandChallenger = model.HashedHand;
            }
            else
            {
                currentRound.HashedHandOpponent = model.HashedHand;
            }

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

            var web3 = new Web3(new Account(_account.Value.MasterAccountPrivateKey), _account.Value.Address);
            if (game.Address == null)
            {
                var deployedContractResult = await web3.Eth.DeployContract.SendRequestAsync(abi, binary, _account.Value.MasterAccountAddress, new HexBigInteger(2000000),
                    game.Challenger.Address, game.Opponent.Address, HexByteConvertorExtensions.HexToByteArray(currentRound.HashedHandChallenger), HexByteConvertorExtensions.HexToByteArray(currentRound.HashedHandOpponent));
                game.CreatedTransactionHash = deployedContractResult;
                _context.SaveChanges();
                CreateGameAddressJob job = new CreateGameAddressJob(_context, _account);
                long gameId = game.Id;
                BackgroundJob.Schedule(() => job.PollForAddress(deployedContractResult, game.Id), TimeSpan.FromSeconds(5));
                await _context.SaveChangesAsync();
            }
            else if (currentRound.HashedHandChallenger != null && currentRound.HashedHandOpponent != null)
            {
                var contract = web3.Eth.GetContract(abi, game.Address);
                var playHandsFunction = contract.GetFunction("playHands");
                var trx = await playHandsFunction.SendTransactionAsync(_account.Value.MasterAccountAddress, new HexBigInteger(2000000), HexByteConvertorExtensions.HexToByteArray(currentRound.HashedHandChallenger), HexByteConvertorExtensions.HexToByteArray(currentRound.HashedHandOpponent));
                if (game.Rounds.Count == 2)
                {
                    PollForRevealHandJob revealHandJob = new PollForRevealHandJob(_context, _account);
                    BackgroundJob.Schedule(() => revealHandJob.PollForReveal(trx, game.Address, game.Id), TimeSpan.FromSeconds(5));
                    await _context.SaveChangesAsync();
                }

            }



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

        public long CurrentRound { get; set; }
        public bool? Winner { get; set; }

        public bool CanBeConfirmed { get; set; }
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