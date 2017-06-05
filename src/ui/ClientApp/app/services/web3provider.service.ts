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
            // engine.addProvider(new RpcSource({
            //     rpcUrl: 'http://bclkihf6w.westeurope.cloudapp.azure.com:8545'
            // }));
            var opts = {
                getAccounts: () => {
                    return this.wallet.getWallet().getAddresses();
                },
                signTransaction: (tx) => {
                    this.wallet.getWallet().signTransaction(tx);
                }
            };
            var hookedWalletProvider = new HookedWalletSubprovider(opts);
            this.engine.addProvider(hookedWalletProvider);
            this.engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider('http://bclkihf6w.westeurope.cloudapp.azure.com:8545')));
            // engine.addProvider(new FilterSubprovider());
           
            this.engine.start();
        }
        return this.engine;
    }
}