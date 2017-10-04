using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Data;
using api.Services;
using api.Util;
using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Nethereum.Web3.TransactionReceipts;

public class BlockchainChangeProcessor
{
    private IOptions<EthereumSettings> _account;
    private BbbgContext _context;

   
    public BlockchainChangeProcessor(BbbgContext dbContext, IOptions<EthereumSettings> account)
    {
        _account = account;
        _context = dbContext;

    }
    [DisableConcurrentExecution(60)]
    [AutomaticRetry(Attempts = 0, LogEvents = false, OnAttemptsExceeded = AttemptsExceededAction.Delete)]
    public async Task Process()
    {
        var web3 = new Web3(new Account(_account.Value.MasterAccountPrivateKey), _account.Value.Address);
        var transactionPolling = new TransactionReceiptPollingService(web3);
        var gameCreateService = new CreateGameService(_context,_account);
        var playHandService = new PlayHandService(_context, _account);
        var actions =   _context.QueuedActions
            .Include(x=>x.Round)
                .ThenInclude(x=>x.Game)
                    .ThenInclude(x=>x.Challenger)
            .Include(x=>x.Round)
                .ThenInclude(x=>x.Game)
                    .ThenInclude(x=>x.Opponent)
            .Where(x=>!x.Processed).OrderBy(x=>x.QueuedOn).Take(10).ToList();
        List<Func<Task<string>>> transactionInputs = new List<Func<Task<string>>>();
        foreach(var action in actions)
        {
            if(action.QueueType == QueueTypes.CreateGame)
            {
                transactionInputs.Add(gameCreateService.CreateTransaction(action, web3));
            }
            else
            {
                transactionInputs.Add(playHandService.CreateTransaction(action, web3));
            }
        }

        var receipts = await transactionPolling.SendRequestAsync(transactionInputs);
        for (int i = 0; i < actions.Count; i++)
        {
            var action = actions[i];
            var receipt = receipts[i];
            if(action.QueueType ==  QueueTypes.CreateGame)
            {
               await  gameCreateService.ProcessReceipt(receipt,web3,action);
            }
            else
            {
                
            }
            action.Processed = true;
            _context.SaveChanges();
        }
        

        
    }
}