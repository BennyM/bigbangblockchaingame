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
using Microsoft.EntityFrameworkCore;
using Nethereum.Web3.TransactionReceipts;
using Nethereum.Hex.HexConvertors.Extensions;
using Nethereum.Hex.HexTypes;

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
        public async Task PollForAddress(long gameId)
        {
            var web3 = new Web3(new Account(_account.Value.MasterAccountPrivateKey), _account.Value.Address);
            var transactionPolling = new TransactionReceiptPollingService(web3);

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
            var game = _dbContext.Games.Include(x => x.Rounds).Single(x => x.Id == gameId);
            var currentRound = game.Rounds.Single();
            var contractAddress = await
                transactionPolling.DeployContractAndGetAddressAsync(
                    () =>
                        web3.Eth.DeployContract.SendRequestAsync(abi, binary, _account.Value.MasterAccountAddress, new HexBigInteger(2000000),
                    game.Challenger.Address, game.Opponent.Address, HexByteConvertorExtensions.HexToByteArray(currentRound.HashedHandChallenger), HexByteConvertorExtensions.HexToByteArray(currentRound.HashedHandOpponent)));


            game.Address = contractAddress;
            game.Rounds.Single().Mined = true;

            var contract = web3.Eth.GetContract(abi, contractAddress);

            var drawEvent = contract.GetEvent("Draw");
            var winnerEvent = contract.GetEvent("GameEnd");
            var startRevealEvent = contract.GetEvent("StartReveal");
            var createDrawEventFilter = drawEvent.CreateFilterAsync();
            var createWinnerEventFilter = winnerEvent.CreateFilterAsync();
            var createStartRevealEvent = startRevealEvent.CreateFilterAsync();
            await Task.WhenAll(createDrawEventFilter, createWinnerEventFilter, createStartRevealEvent);
            var drawEventFilterId = createDrawEventFilter.Result.HexValue;
            game.DrawEventFilterId = drawEventFilterId;
            game.WinnerEventFilterId = createWinnerEventFilter.Result.HexValue;
            _dbContext.SaveChanges();
            var drawEventJob = new PollForDrawJob(_dbContext, _account);
            var winnerJob = new WinnerPollJob(_dbContext, _account);

            BackgroundJob.Schedule(() => drawEventJob.PollForDraw(drawEventFilterId, contractAddress, gameId), TimeSpan.FromSeconds(5));
            BackgroundJob.Schedule(() => winnerJob.PollForWinner(createWinnerEventFilter.Result.HexValue, contractAddress, gameId), TimeSpan.FromSeconds(5));
            PollForRevealHandJob revealHandJob = new PollForRevealHandJob(_dbContext, _account);
            BackgroundJob.Schedule(() => revealHandJob.PollForReveal(createStartRevealEvent.Result.HexValue, game.Address, game.Id), TimeSpan.FromSeconds(5));

        }
    }

}