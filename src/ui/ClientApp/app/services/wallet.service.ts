import { Injectable } from '@angular/core';
import * as Web3 from 'web3';
import { keystore } from 'eth-lightwallet';
import * as Web3ProviderEngine from 'web3-provider-engine';
import * as RpcSource from 'web3-provider-engine/subproviders/rpc';
import * as HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet';

@Injectable()
export class WalletService {

    private ks: any;

    getWallet() : any{
        if(!this.ks){
            throw "No keystore configured"
        }
        return this.ks;
    }

    getOrCreateVault(secretKey: string): Promise<any> {
        let promise = new Promise((resolve, reject) => {
            if (typeof window !== "undefined" && !this.ks) {
                let serializedKeystore = localStorage.getItem('keystore');
                if (serializedKeystore) {
                    this.ks = keystore.deserialize(serializedKeystore);
                    this.ks.passwordProvider = (callback) => {
                        callback(null, secretKey);
                    };
                    resolve(this.ks);
                } else {
                    keystore.createVault({
                        password: secretKey
                    }, (err, newStore) => {
                        if (newStore) {
                            this.ks = newStore;
                            this.ks.passwordProvider = (callback) => {
                                callback(null, secretKey);
                            };
                            this.ks.keyFromPassword(secretKey, (err, pwDerivedKey) => {
                                if (err) reject(err);

                                this.ks.generateNewAddress(pwDerivedKey, 1);


                                var serializedKs = this.ks.serialize();
                                localStorage.setItem('keystore', serializedKs);
                                resolve(this.ks);

                            });
                        } else {
                            reject(err);
                        }
                        
                    });
                }
            }});
            return promise;
        };


    

    constructor() {

    }
}