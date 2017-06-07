using System.Threading.Tasks;
using api.Data;
using api.Util;
using Microsoft.Extensions.Options;
using Nethereum.Web3;
using System.Linq;
using Hangfire;
using System;
using System.Reflection;
using System.IO;
using Newtonsoft.Json.Linq;
using Nethereum.Hex.HexTypes;
using Nethereum.ABI.FunctionEncoding.Attributes;
using System.Data;
using Microsoft.EntityFrameworkCore;

namespace api.Jobs
{

    public class WinnerPollJob
    {
        private BbbgContext _dbContext;
        private IOptions<EthereumSettings> _account;
    

        public WinnerPollJob(BbbgContext dbContext, IOptions<EthereumSettings> account)
        {
            _dbContext = dbContext;
            _account = account;
        }
        public async Task PollForWinner(string filterId, string contractAddress, long gameId)
        {
            var assembly = typeof(GamesController).GetTypeInfo().Assembly;
            string abi = null;
            string binary = null;
            using (Stream resource = assembly.GetManifestResourceStream("api.BlindGame.json"))
            {
                using (var streamReader = new StreamReader(resource))
                {
                    var contractJson = streamReader.ReadToEnd();
                    JObject obj = JObject.Parse(contractJson);
                    abi = obj.Property("abi").Value.ToString();
                    binary = obj.Property("unlinked_binary").Value.ToString();
                }
            }

            var web3 = new Web3(_account.Value.Address);
            var code = await web3.Eth.GetCode.SendRequestAsync(contractAddress);
            var contract = web3.Eth.GetContract(abi, contractAddress);

            var winnerEvent = contract.GetEvent("GameEnd");


            var changes = await winnerEvent.GetFilterChanges<WinnerEvent>(new HexBigInteger(filterId));


            if (changes.Any())
            {
                var game = _dbContext.Games.Include(x => x.Rounds).Include(x => x.Challenger).Include(x => x.Opponent).Single(x => x.Id == gameId);
                var winEvent = changes.Single().Event;
                var round = game.Rounds.OrderBy(x => x.RoundNumber).Last();
                if (round.Outcome == RoundOutcome.None)
                {
                    round.Outcome = RoundOutcome.Winner;
                }
                game.WinningHand = (Hands)winEvent.WinningHand;
                game.LosingHand = (Hands)winEvent.LosingHand;
                Player winner = null;
                if ("0x" + game.Challenger.Address == winEvent.Winner)
                {
                    winner = game.Challenger;
                }
                else
                {
                    winner = game.Opponent;
                }

                _dbContext.SaveChanges();
            }
            else
            {
                BackgroundJob.Schedule(() => PollForWinner(filterId, contractAddress, gameId), TimeSpan.FromSeconds(5));
            }
        }
    }

    // [FunctionOutput]
    // public class GetHandFromResult
    // {
    //     [Parameter("bytes32", 1)]
    //     public string State1 { get; set; }
    //     [Parameter("uint8", 2)]
    //     public int State2 { get; set; }

    //     [Parameter("bytes32", 3)]
    //     public string State3 { get; set; }

    //     [Parameter("uint8", 4)]
    //     public int State4 { get; set; }


    // }
    public class WinnerEvent
    {
        [Parameter("address", "winner", 1, false)]
        public string Winner { get; set; }

        [Parameter("address", "loser", 2, false)]
        public string Loser { get; set; }

        [Parameter("uint8", "winningHand", 3, false)]
        public int WinningHand { get; set; }

        [Parameter("uint8", "LosingHand", 4, false)]
        public int LosingHand { get; set; }
    }
}