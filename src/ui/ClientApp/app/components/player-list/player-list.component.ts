import { Component } from '@angular/core';
import { Http } from '@angular/http';
// import * as Web3  from 'web3';
// import { keystore } from 'eth-lightwallet';
// import * as Web3ProviderEngine  from 'web3-provider-engine';
// import * as RpcSource  from 'web3-provider-engine/subproviders/rpc';
// import * as HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet';
// import { default as contract } from 'truffle-contract';

// // Import our contract artifacts and turn them into usable abstractions.
// import * as blindgame_artifact from '../contracts-abi/BlindGame.json';


@Component({
    selector: 'player-list',
    templateUrl: './player-list.component.html'
})
export class PlayerListComponent {
    public players: Player[];

    constructor(http: Http) {
        console.log('test');
      this.players = [ 
          { name : 'Benny', gamesWon: 3, gamesPlayed : 6 },
          { name : 'Hans', gamesWon: 3, gamesPlayed : 6 }
      ];
    
//         var global_keystore;

//         keystore.createVault({
//             password: 'password'
//         }, function (err, ks) {
//             console.log('this is the keystore');
//             console.log(ks);
//             if (ks) {
//                 ks.passwordProvider = function (callback) {
//                     callback(null, 'password');
//                 };
//                 global_keystore = ks;
               
//                 var engine =  new Web3ProviderEngine();
                
//                 engine.addProvider(new RpcSource({
//   rpcUrl: 'http://bclkihf6w.westeurope.cloudapp.azure.com:8545',
// }))
                
//                 ks.keyFromPassword('password', function (err, pwDerivedKey) {
//                     if (err) throw err;

//                     ks.generateNewAddress(pwDerivedKey, 1);
//                     var addr = ks.getAddresses();
//                     var opts ={
//                         getAccounts : function(){
//                             return ks.getAddresses();
//                         },
//                         signTransaction : function(tx){
//                             ks.signTransaction(tx);
//                         }
//                     };
//                     var hookedWalletProvider = new HookedWalletSubprovider(opts);
//                     engine.addProvider(hookedWalletProvider)
//                   var web3 = new Web3(engine);
//                     engine.start();
//                     console.log('addresses:');
//                     console.log(addr);
//                     console.log(addr[0]);

//                     var serializedKs = ks.serialize();
//                     web3.eth.getBalance(addr[0], function(err, result){
//                         console.log(result);
//                         var BlindGame = contract(blindgame_artifact);
//                          BlindGame.setProvider(web3.currentProvider);
//                     });


//                 });
//             }
//         });
    }
}

interface Player {
    name : string,
    gamesWon : number,
    gamesPlayed : number
}
