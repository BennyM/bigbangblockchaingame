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

namespace api.Data
{
    [Authorize]
    [Route("api/games")]
    public class GamesController
        : Controller
    {
        private BbbgContext _context;
        private IOptions<EthereumTransferAccount> _account;
        public GamesController(BbbgContext context, IOptions<EthereumTransferAccount> account)
        {
            _context = context;
            _account = account;
        }
        
        [Route("")]
        [HttpGet]
        public IEnumerable<GameOverviewModel> GamesOfUser()
        {
            var userId = new Guid(User.Claims.Single(cl => cl.Type == ClaimTypes.NameIdentifier).Value);
            return _context.Games
                .Where(x => x.ChallengerId == userId || x.OpponentId == userId)
                .Select(x => new GameOverviewModel{
                    OpponentName = x.Opponent.Nickname,
                    ChallengerName = x.Challenger.Nickname,
                    Address = x.Address
                } );
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
                DateCreated = DateTime.UtcNow
             };
             _context.Games.Add(g);
             _context.SaveChanges();
             return g.Id;
        }

        [HttpPost]
        [Route("{id}/hand")]
        public async void PlayHand(long id, string hashedHand)
        {
            var opponentId = new Guid(User.Claims.Single(cl => cl.Type == ClaimTypes.NameIdentifier).Value);
            var game = _context.Games.Single(x => x.Id == id && x.OpponentId == opponentId  && x.OpponentHand == null);
            game.OpponentHand = hashedHand;
            _context.SaveChanges();

            var abi = "";
            var byteCode ="";
            var web3 = new Web3();
            var deployedContractResult = await web3.Eth.DeployContract.SendRequestAsync(abi, byteCode, _account.Value.Address, game.Challenger.Address, game.Opponent.Address, game.ChallengerHand, game.OpponentHand);
            var receipt = await web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(deployedContractResult);
            while (receipt == null)
            {
                Thread.Sleep(5000);
                receipt = await web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(deployedContractResult);
            }
            var contractAddress = receipt.ContractAddress;
            game.Address = contractAddress;
            _context.SaveChanges();
        }
    }

public class GameOverviewModel
{

    public string OpponentName {get;set;}
    public string ChallengerName {get;set;}
    public string Address {get;set;}
}

}