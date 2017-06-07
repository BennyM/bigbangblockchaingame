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
using Nethereum.Web3.Accounts;

namespace api.Jobs
{

    public class CreateGameAddressJob
    {
        private BbbgContext _dbContext;
        private IOptions<EthereumSettings> _account;

        public CreateGameAddressJob(BbbgContext dbContext, IOptions<EthereumSettings> account)
        {
            _dbContext = dbContext;
            _account = account;
        }
        public async Task PollForAddress(string transactionHash, long gameId)
        {
            var web3 = new Web3(new Account(_account.Value.MasterAccountPrivateKey), _account.Value.Address);
            var receipt = await web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(transactionHash);
            if (receipt != null)
            {
                var contractAddress = receipt.ContractAddress;
                var game = _dbContext.Games.Single(x => x.Id == gameId);
                game.Address = receipt.ContractAddress;
               
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
                var contract = web3.Eth.GetContract(abi, receipt.ContractAddress);

                var drawEvent = contract.GetEvent("Draw");
                var winnerEvent = contract.GetEvent("GameEnd");
                var createDrawEventFilter = drawEvent.CreateFilterAsync();
                var createWinnerEventFilter = winnerEvent.CreateFilterAsync();
                await Task.WhenAll(createDrawEventFilter, createWinnerEventFilter);
                var drawEventFilterId = createDrawEventFilter.Result.HexValue;
                game.DrawEventFilterId = drawEventFilterId;
                game.WinnerEventFilterId = createWinnerEventFilter.Result.HexValue;
                _dbContext.SaveChanges();
                var drawEventJob = new PollForDrawJob(_dbContext, _account);
                var winnerJob = new WinnerPollJob(_dbContext, _account);
                 BackgroundJob.Schedule(() => drawEventJob.PollForDraw(drawEventFilterId, contractAddress,gameId), TimeSpan.FromSeconds(5));
                BackgroundJob.Schedule(() => winnerJob.PollForWinner(createWinnerEventFilter.Result.HexValue, contractAddress,gameId), TimeSpan.FromSeconds(5));
           
            }
            else
            {
                BackgroundJob.Schedule(() => PollForAddress(transactionHash, gameId), TimeSpan.FromSeconds(5));
            }
        }
    }
}