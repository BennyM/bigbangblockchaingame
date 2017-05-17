using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nethereum;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth.DTOs;

namespace api.Controllers
{
    [Route("api/[controller]")]
    public class AccountsController : Controller
    {

        // POST api/values
        public async Task<string> Post(string address)
        {
            
            var personalAddress = "0x12f08c03a44c0c97e01f3ae91ae7e6060aea0545";
            var privateKey = "bb3221e28e71cc62a21f7f6869a1b706463dd3eef5c909ca0c705c6ced19483d";
            var web3 = new Nethereum.Web3.Web3();

            var txCount = await web3.Eth.Transactions.GetTransactionCount.SendRequestAsync(personalAddress);
            var encoded = web3.OfflineTransactionSigner.SignTransaction(privateKey, address, 10, txCount.Value);
            
            await web3.Eth.Transactions.SendRawTransaction.SendRequestAsync("0x" + encoded);
            return "ok";
        }

    }
}
