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
using Nethereum.Hex.HexConvertors.Extensions;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth;
using Nethereum.Contracts;
using Nethereum.RPC.Eth.DTOs;
using api.Jobs;
using Nethereum.RPC.Eth.Exceptions;

namespace api.Services
{

    public class CreateGameService
    {
        private BbbgContext _dbContext;
        private IOptions<EthereumSettings> _account;
        private string _abi;
        private string _binary;
        public CreateGameService(BbbgContext dbContext, IOptions<EthereumSettings> account)
        {
            _dbContext = dbContext;
            _account = account;
            var assembly = typeof(GamesController).GetTypeInfo().Assembly;


            using (Stream resource = assembly.GetManifestResourceStream("api.BlindGame.json"))
            {
                using (var streamReader = new StreamReader(resource))
                {
                    var contractJson = streamReader.ReadToEnd();
                    JObject obj = JObject.Parse(contractJson);
                    _abi = obj.Property("abi").Value.ToString();
                    _binary = obj.Property("unlinked_binary").Value.ToString();
                }
            }
        }
        public Func<Task<string>> CreateTransaction(QueuedAction action, Web3 web3)
        {
            var currentRound = action.Round;
            return
                () =>
                    web3.Eth.DeployContract.SendRequestAsync(_abi, _binary,
                    _account.Value.MasterAccountAddress,
                    new HexBigInteger(3000000),
                    currentRound.Game.Challenger.Address,
                    currentRound.Game.Opponent.Address,
                    HexByteConvertorExtensions.HexToByteArray(currentRound.HashedHandChallenger),
                    HexByteConvertorExtensions.HexToByteArray(currentRound.HashedHandOpponent));



        }

        public async Task ProcessReceipt(TransactionReceipt receipt, Web3 web3, QueuedAction action)
        {
            var contractAddress = receipt.ContractAddress;
            var ethGetCode = new EthGetCode(web3.Client);
            var code = await ethGetCode.SendRequestAsync(contractAddress);
            if (code == "0x") throw new ContractDeploymentException("Code not deployed succesfully", receipt);

            action.Round.Game.Address = contractAddress;
            action.Round.Mined = true;

            var contract = web3.Eth.GetContract(_abi, contractAddress);

            var drawEvent = contract.GetEvent("Draw");
            var winnerEvent = contract.GetEvent("GameEnd");
            var startRevealEvent = contract.GetEvent("StartReveal");
            var createDrawEventFilter = drawEvent.CreateFilterAsync();
            var createWinnerEventFilter = winnerEvent.CreateFilterAsync();
            var createStartRevealEvent = startRevealEvent.CreateFilterAsync();
            Task.WaitAll(createDrawEventFilter, createWinnerEventFilter, createStartRevealEvent);
            var drawEventFilterId = createDrawEventFilter.Result.HexValue;
            action.Round.Game.DrawEventFilterId = drawEventFilterId;
            action.Round.Game.WinnerEventFilterId = createWinnerEventFilter.Result.HexValue;
            _dbContext.SaveChanges();
            var drawEventJob = new PollForDrawJob(_dbContext, _account);
            var winnerJob = new WinnerPollJob(_dbContext, _account);

            BackgroundJob.Schedule(() => drawEventJob.PollForDraw(drawEventFilterId, contractAddress, action.Round.Game.Id), TimeSpan.FromSeconds(5));
            BackgroundJob.Schedule(() => winnerJob.PollForWinner(createWinnerEventFilter.Result.HexValue, contractAddress, action.Round.Game.Id), TimeSpan.FromSeconds(5));
            PollForRevealHandJob revealHandJob = new PollForRevealHandJob(_dbContext, _account);
            BackgroundJob.Schedule(() => revealHandJob.PollForReveal(createStartRevealEvent.Result.HexValue, action.Round.Game.Address, action.Round.Game.Id), TimeSpan.FromSeconds(5));
        }
    }

}