import { WalletService } from './wallet.service';
import { Injectable } from '@angular/core';
import * as RpcSource from 'web3-provider-engine/subproviders/rpc';
import * as HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet';
import * as Web3ProviderEngine from 'web3-provider-engine';
import * as Web3 from 'web3';

@Injectable()
export class web3providerservice {

    private web3: Web3;

    getOrCreateWeb3Provider(WalletService: WalletService): Web3ProviderEngine {
        if (!this.web3) {
            let engine = new Web3ProviderEngine();
            engine.addProvider(new RpcSource({
                rpcUrl: 'http://bclkihf6w.westeurope.cloudapp.azure.com:8545'
            }));
            var opts = {
                getAccounts: () => {
                    return WalletService.getWallet().getAddresses();
                },
                signTransaction: (tx) => {
                    WalletService.getWallet().signTransaction(tx);
                }
            };
            var hookedWalletProvider = new HookedWalletSubprovider(opts);
            engine.addProvider(hookedWalletProvider)
            this.web3 = new Web3(engine);
            engine.start();
        }
        return this.web3;


    }
}