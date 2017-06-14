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

    public class PollForDrawJob
    {
        private BbbgContext _dbContext;
        private IOptions<EthereumSettings> _account;


        public PollForDrawJob(BbbgContext dbContext, IOptions<EthereumSettings> account)
        {
            _dbContext = dbContext;
            _account = account;
        }
        public async Task PollForDraw(string filterId, string contractAddress, long gameId)
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

            var drawEvent = contract.GetEvent("Draw");


            var changes = await drawEvent.GetFilterChanges<DrawEvent>(new HexBigInteger(filterId));


            if (changes.Any())
            {
                var game = _dbContext.Games.Include(x => x.Rounds).Single(x => x.Id == gameId);
                foreach (var drawEvents in changes.Select(x => x.Event).OrderBy(x => x.NewRound))
                {
                    var round = game.Rounds.Single(x => x.RoundNumber == drawEvents.NewRound - 1);
                    round.Outcome = RoundOutcome.Draw;
                    if (!game.Rounds.Any(x => x.RoundNumber == drawEvents.NewRound))
                    {
                        game.Rounds.Add(new GameRound() { RoundNumber = drawEvents.NewRound });
                    }
                }
            }
            _dbContext.SaveChanges();

            var winnerFunc = contract.GetFunction("winner");
            var addr = await winnerFunc.CallAsync<string>();
            if (addr == "0x0000000000000000000000000000000000000000")
            {
                BackgroundJob.Schedule(() => PollForDraw(filterId, contractAddress, gameId), TimeSpan.FromSeconds(5));
            }


        }
    }

    [FunctionOutput]
    public class GetHandFromResult
    {
        [Parameter("bytes32", 1)]
        public string State1 { get; set; }
        [Parameter("uint8", 2)]
        public int State2 { get; set; }

        [Parameter("bytes32", 3)]
        public string State3 { get; set; }

        [Parameter("uint8", 4)]
        public int State4 { get; set; }


    }

    public class DrawEvent
    {
        [Parameter("uint8", "draw", 1, false)]
        public int State { get; set; }

        [Parameter("uint256", "newRoundNumber", 1, false)]
        public long NewRound { get; set; }
    }
}