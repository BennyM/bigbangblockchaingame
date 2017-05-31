import { Injectable } from '@angular/core';
import * as Web3 from 'web3';
import { keystore } from 'eth-lightwallet';
import * as Web3ProviderEngine from 'web3-provider-engine';
import * as RpcSource from 'web3-provider-engine/subproviders/rpc';
import * as HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet';

@Injectable()
export class WalletService {

    private superSecurePassword: string = 'password';
    private ks: any;

    getOrCreateVault(): any {
        if (typeof window !== "undefined" && !this.ks) {
            let serializedKeystore = localStorage.getItem('keystore');

            if (serializedKeystore) {
                this.ks = keystore.deserialize(serializedKeystore);
                this.ks.passwordProvider = (callback) => {
                    callback(null, this.superSecurePassword);
                };
            } else {
                keystore.createVault({
                    password: this.superSecurePassword
                }, (err, newStore) => {
                    if (newStore) {
                        this.ks = newStore;
                        this.ks.passwordProvider = (callback) => {
                            callback(null, this.superSecurePassword);
                        };
                        this.ks.keyFromPassword(this.superSecurePassword, (err, pwDerivedKey) => {
                            if (err) throw err;

                            this.ks.generateNewAddress(pwDerivedKey, 1);


                            var serializedKs = this.ks.serialize();
                            localStorage.setItem('keystore', serializedKs);


                        });
                    }
                });
            }
            return this.ks;
        }

    }

    constructor() {

    }
}