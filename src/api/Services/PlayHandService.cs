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
using Nethereum.RPC.Eth;
using Nethereum.Contracts;
using Nethereum.RPC.Eth.DTOs;
using api.Jobs;

namespace api.Services
{

    public class PlayHandService
    {
        private BbbgContext _dbContext;
        private IOptions<EthereumSettings> _account;
        private string _abi;
        private string _binary;
        public PlayHandService(BbbgContext dbContext, IOptions<EthereumSettings> account)
        {
            _dbContext = dbContext;
            _account = account;
            var assembly = typeof(GamesController).GetTypeInfo().Assembly;
           
            string binary = null;
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
        public  Func<Task<string>> CreateTransaction(QueuedAction action, Web3 web3)
        {
            var contract = web3.Eth.GetContract(_abi, action.Round.Game.Address);
            var playHandsFunction = contract.GetFunction("playHands");
            return () => playHandsFunction.SendTransactionAsync(
                _account.Value.MasterAccountAddress, 
                new HexBigInteger(2000000), 
                new HexBigInteger(0), 
                HexByteConvertorExtensions.HexToByteArray(action.Round.HashedHandChallenger), 
                HexByteConvertorExtensions.HexToByteArray(action.Round.HashedHandOpponent));


           
        }

        public Task ProcessReceipt(TransactionReceipt receipt, Web3 web3, QueuedAction action)
        {
            return Task.FromResult(true);
        }
    }

}