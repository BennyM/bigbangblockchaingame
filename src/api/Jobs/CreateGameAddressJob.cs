using System.Threading.Tasks;
using api.Data;
using api.Util;
using Microsoft.Extensions.Options;
using Nethereum.Web3;
using System.Linq;
using Hangfire;
using System;

namespace api.Jobs{

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
            var web3 = new Web3(_account.Value.Address);
            var receipt = await web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(transactionHash);
            if(receipt != null)
            {
                var contractAddress = receipt.ContractAddress;
                var game = _dbContext.Games.Single(x => x.Id ==gameId);
                game.Address = receipt.ContractAddress;
                _dbContext.SaveChanges();
            } 
            else{
            
                BackgroundJob.Schedule(() => PollForAddress(transactionHash, gameId), TimeSpan.FromSeconds(5));
            }   
        }
    }
}