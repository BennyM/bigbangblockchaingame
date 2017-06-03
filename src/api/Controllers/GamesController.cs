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
            
            return await _context.Games
                .Where(x => x.ChallengerId == userId || x.OpponentId == userId)
                .Select(x => new GameOverviewModel
                {
                    OpponentName = x.Opponent.Nickname,
                    ChallengerName = x.Challenger.Nickname,
                    Address = x.Address
                })
                .ToListAsync();
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
                ChallengerHand = model.HashedHand,
                DateCreated = DateTime.UtcNow
            };
            _context.Games.Add(g);
            await _context.SaveChangesAsync();

            return g.Id;
        }

        [HttpPost]
        [Route("{id}/hand")]
        public async Task PlayHand(long id, string hashedHand)
        {
            var opponentId = new Guid(User.Claims.Single(cl => cl.Type == ClaimTypes.NameIdentifier).Value);

            var game = await _context.Games.SingleAsync(x => x.Id == id && x.OpponentId == opponentId && x.OpponentHand == null);
            game.OpponentHand = hashedHand;
            await _context.SaveChangesAsync();

            var assembly = typeof(GamesController).GetTypeInfo().Assembly;
            string abi = null;
            string binary = null;
            using (Stream resource = assembly.GetManifestResourceStream("api.BlindGame.json"))
            {
                using(var streamReader = new StreamReader(resource))
                {
                    var contract = streamReader.ReadToEnd();
                    JObject obj = JObject.Parse(contract);
                    abi = obj.Property("abi").Value.ToString();
                    binary = obj.Property("unlinked_binary").Value.ToString();
                }
            }
           
            var web3 = new Web3(_account.Value.Address);
            var deployedContractResult = await web3.Eth.DeployContract.SendRequestAsync(abi, binary, _account.Value.MasterAccountAddress, game.Challenger.Address, game.Opponent.Address, game.ChallengerHand, game.OpponentHand);
            var receipt = await web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(deployedContractResult);
            while (receipt == null)
            {
                Thread.Sleep(5000);
                receipt = await web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(deployedContractResult);
            }
            var contractAddress = receipt.ContractAddress;
            game.Address = contractAddress;
            await _context.SaveChangesAsync();
        }
    }

    public class GameOverviewModel
    {
        public string OpponentName { get; set; }
        public string ChallengerName { get; set; }
        public string Address { get; set; }
    }

    public class ChallengeOpponentModel 
    {
        public Guid OpponentId { get; set; }
        public string HashedHand { get; set; }
    }
}