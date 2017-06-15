import { WalletService } from './wallet.service';
import { Injectable } from '@angular/core';
import * as RpcSource from 'web3-provider-engine/subproviders/rpc';
import * as HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet';
import * as Web3ProviderEngine from 'web3-provider-engine';
import * as Web3 from 'web3';
import * as FilterSubprovider from 'web3-provider-engine/subproviders/filters';
import * as Web3Subprovider from 'web3-provider-engine/subproviders/web3';

@Injectable()
export class Web3ProviderService {

    private engine: Web3ProviderEngine;

    constructor(private wallet: WalletService){

    }

    getOrCreateWeb3Provider(): Web3ProviderEngine {
        if (!this.engine) {
            this.engine = new Web3ProviderEngine();
            var opts = {
                getAccounts: (cb) => {
                    let addresses = this.wallet.getWallet().getAddresses();
                    let prefixedAddresses =addresses.map(add => {
                        return '0x' + add;
                    });
                    cb(null, prefixedAddresses);
                },
                signTransaction: (tx, cb) => {
                    let signedTransactionCallback = (error, result) =>{
                        cb(null, result);
                    };
                    this.wallet.getWallet().signTransaction(tx, signedTransactionCallback);
                }
            };
            var hookedWalletProvider = new HookedWalletSubprovider(opts);
            this.engine.addProvider(hookedWalletProvider);
           this.engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider('http://bbbgbcbuj.westeurope.cloudapp.azure.com:8545')));
           
            this.engine.start();
            var web3 = new Web3(this.engine);
           web3.eth.getBalance('0x' + this.wallet.getWallet().getAddresses()[0], (error, result) => console.log("balance: " + result));
            
        }
        return this.engine;
    }
}