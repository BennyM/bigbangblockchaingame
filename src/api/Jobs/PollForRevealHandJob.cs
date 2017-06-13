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

    public class PollForRevealHandJob
    {
        private BbbgContext _dbContext;
        private IOptions<EthereumSettings> _account;


        public PollForRevealHandJob(BbbgContext dbContext, IOptions<EthereumSettings> account)
        {
            _dbContext = dbContext;
            _account = account;
        }
        public async Task PollForReveal(string filterId, string contractAddress, long gameId)
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

            var drawEvent = contract.GetEvent("StartReveal");


            var changes = await drawEvent.GetFilterChanges<StartRevealEvent>(new HexBigInteger(filterId));


            if (changes.Any())
            {
                var game = _dbContext.Games.Include(x => x.Rounds).Single(x => x.Id == gameId);
                foreach (var revealRound in changes)
                {
                    var round = game.Rounds.Single(x => x.RoundNumber == revealRound.Event.RoundNumber);
                    round.Mined = true;
                }
            }
            _dbContext.SaveChanges();
            var winnerFunc = contract.GetFunction("winner");
            var addr = await winnerFunc.CallAsync<string>();
            if (addr != "0x0000000000000000000000000000000000000000")
            {

                BackgroundJob.Schedule(() => PollForReveal(filterId, contractAddress, gameId), TimeSpan.FromSeconds(5));
            }


        }
    }

    public class StartRevealEvent
    {
        [Parameter("uint256", "roundNumber", 1, false)]
        public int RoundNumber { get; set; }


    }
}